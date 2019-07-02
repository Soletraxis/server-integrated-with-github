const http = require("http");
const { App } = require("@octokit/app");
const { request } = require("@octokit/request");
const axios = require("axios");


const app = new App({ id: APP_ID, privateKey: PRIVATE_KEY });
const jwt = app.getSignedJsonWebToken();

const getInstallationData = async (name, login) => {
  return await request("GET /repos/:owner/:repo/installation", {
    owner: login,
    repo: name,
    headers: {
      authorization: `Bearer ${jwt}`,
      accept: "application/vnd.github.machine-man-preview+json"
    }
  })
    .then(e => e.data)
    .catch(e => console.log("rej"));
};

const installationId = (name, login) => getInstallationData(name, login);
const installationAccessToken = async (name, login) => {
  const { id } = await installationId(name, login);
  console.log("id", id);
  return await app
    .getInstallationAccessToken({
      installationId: id
    })
    .then(e => e)
    .catch(e => console.log("rej", e));
};

// https://developer.github.com/v3/issues/#create-an-issue
const getReposContents = async (
  { name, owner: { login } },
  path = "",
  branch = "master"
) => {
  return await request("GET /repos/:owner/:repo/contents/:path?ref=:branch", {
    owner: login,
    repo: name,
    path: path,
    branch: branch,
    headers: {
      authorization: `token ${await installationAccessToken(name, login)}`,
      accept: "application/vnd.github.machine-man-preview+json"
    },
    title: "My installation’s first issue"
  })
    .then(e => e.data)
    .catch(e => console.log("rejection"));
};

http
  .createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    req.on("data", async chunk => {
      const payload = JSON.parse(chunk);

      const files = await getReposContents(
        payload.repository,
        "",
        payload.pull_request.head.ref
      ).then(async e => {
        return await getWholeRepo(
          e,
          payload.repository,
          payload.pull_request.head.ref
        );
      });
      const cos = await Promise.all(reduceFilesToOneArray(files)).then(e=> e).catch(e=> console.log(e));
      const odp = await Promise.all(cos.map(async e => {
          const rawFile = await getRawFile(e.download_url);
          return checkIfCodeContainsMixpanel(rawFile) && e;
      })) .then(e=>e.filter(item => item))//.then(e => e.filter(checkIfCodeContainsMixpanel))
        console.log(await getRawFile(odp[0].download_url))
    });
    res.write(req.url);
    res.end("Hello world");
  })
  .listen(8001);

const getWholeRepo = async (files, repository, branch) => {
  const dataPromises = await files.map(async file => {
    if (file.type === "dir") {
      const filesPromises = await getReposContents(
        repository,
        file.path,
        branch
      )
        .then(async e => await getWholeRepo(e, repository, branch))
        .catch(e => console.log("rej", e));
      const data = Promise.all(filesPromises).then(e => {
        return e;
      });
      return await data;
    } else {
      return file;
    }
  });
  return Promise.all(dataPromises).then(e => e);
};
const reduceFilesToOneArray = files => {
  return files.reduce((acc, item) => {
    if (item.length !== undefined) {
      return [...acc, ...reduceFilesToOneArray(item)];
    } else {
      return [...acc, item];
    }
  }, []);
};

const getRawFile = file => {
  return axios
    .get(file)
    .then(e => (typeof e.data === "string" ? e.data : JSON.stringify(e.data)));
};

const checkIfCodeContainsMixpanel = code => {
  return code.toUpperCase().includes("mixpanel".toUpperCase());
};
