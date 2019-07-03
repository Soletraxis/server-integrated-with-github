const http = require("http");

const reduceFilesToOneArray = require("./helpers/reduceFilesToOneArray/reduceFilesToOneArray");
const getRawFile = require("./getDataFromRepo/getRawFile");
const getLineNumber = require("./helpers/getLineNumber/getLineNumber");
const checkIfCodeContainsMixpanel = require("./helpers/checkIfCodeContainsMixpanel/checkIfCodeContainsMixpanel");
const getWholeRepo = require("./getDataFromRepo/getWholeRepo");
const getReposContents = require("./getDataFromRepo/getReposContents");
http
  .createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    req.on("data", async chunk => {
      const payload = JSON.parse(chunk);
      let files;
      if (
        payload.action === "closed" ||
        payload.action === "reopened" ||
        payload.action === "opened"
      ) {
        files = await getReposContents(
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
      }
      if (payload.action === "added") {
        files = await Promise.all(
          payload.repositories_added.map(async repository => {
            return await getReposContents(repository, "").then(async e => {
              return await getWholeRepo(e, repository);
            });
          })
        ).then(e => e);
      }
      if(!files) return;
      const cos = await Promise.all(reduceFilesToOneArray(files))
        .then(e => e)
        .catch(e => console.log(e));
      const odp = await Promise.all(
        cos.map(async e => {
          const rawFile = await getRawFile(e.download_url);
          return checkIfCodeContainsMixpanel(rawFile) && e;
        })
      ).then(e => e.filter(item => item));
      Promise.all(
        odp.map(async e => {
          const rawFile = await getRawFile(e.download_url);
          return getLineNumber(
            rawFile.substring(
              0,
              rawFile.toUpperCase().indexOf("mixpanel".toUpperCase())
            ),
            "\n"
          );
        })
      ).then(e => console.log(e));
    });
    res.write(req.url);
    res.end("Hello world");
  })
  .listen(8001);
