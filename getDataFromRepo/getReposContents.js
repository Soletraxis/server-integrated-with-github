const { request } = require("@octokit/request");
const installationAccessToken = require("./getInstallationData");
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

module.exports = getReposContents;
