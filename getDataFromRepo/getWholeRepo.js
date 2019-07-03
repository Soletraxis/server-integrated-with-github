const getReposContents = require("./getReposContents");

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

module.exports = getWholeRepo;
