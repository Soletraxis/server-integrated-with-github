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
        return await getWholeRepo(e, payload.repository);
      });
      Promise.all(getRawUrls(files).map(getRawFile)).then(e => console.log(e));
    });
    res.write(req.url);
    res.end("Hello world");
  })
  .listen(8001);

const getWholeRepo = async (repo, repository) => {
  const dataPromises = await repo.map(async file => {
    if (file.type === "dir") {
      const filesPromises = await getReposContents(
        repository,
        file.path,
        "Soletraxis-patch-3"
      )
        .then(async e => await getWholeRepo(e, repository))
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
const getRawUrls = files => {
  return files.reduce((acc, item) => {
    if (item.length !== undefined) {
      return [...acc, ...getRawUrls(item)];
    } else {
      return [...acc, item.download_url];
    }
  }, []);
};

const getRawFile = file => {
  return axios.get(file).then(e => e.data);
};
