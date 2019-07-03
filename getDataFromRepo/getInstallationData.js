const { request } = require("@octokit/request");
const { App } = require("@octokit/app");

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

  return await app
    .getInstallationAccessToken({
      installationId: id
    })
    .then(e => e)
    .catch(e => console.log("rej", e));
};

module.exports = installationAccessToken;
