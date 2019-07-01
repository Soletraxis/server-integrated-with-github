const http = require("http");
const { App } = require("@octokit/app");
const { request } = require("@octokit/request");


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
const createIssue = async ({ name, owner: { login } }) => {
  await request("GET /repos/:owner/:repo/contents", {
    owner: login,
    repo: name,
    headers: {
      authorization: `token ${await installationAccessToken(name, login)}`,
      accept: "application/vnd.github.machine-man-preview+json"
    },
    title: "My installation’s first issue"
  }).then(e=> console.log(e.data));
};

http
  .createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    req.on("data", chunk => {
      const payload = JSON.parse(chunk);

      createIssue(payload.repository)
        .then(e => console.log("suc", e))
        .catch(e => console.log("rej issue", e));
      //payload.commits.map(item => getCommitDiff(item, payload.repository));
    });
    res.write(req.url);
    res.end("Hello world");
  })
  .listen(8001);
