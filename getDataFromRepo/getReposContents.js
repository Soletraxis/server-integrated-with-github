const { request } = require("@octokit/request");
const installationAccessToken = require("./getInstallationData");
const getReposContents = async (
  { full_name },
  path = "",
  branch
) => {
  const [owner, name] = full_name.split("/");
  return await request(`GET /repos/:owner/:repo/contents/:path${branch ?'?ref=:branch': ''}`, {
    owner: owner,
    repo: name,
    path: path,
    branch: branch,
    headers: {
      authorization: `token ${await installationAccessToken(name, owner)}`,
      accept: "application/vnd.github.machine-man-preview+json"
    },
    title: "My installation’s first issue"
  })
    .then(e => e.data)
    .catch(e => console.log("rejection"));
};

module.exports = getReposContents;
