const http = require("http");
const fs = require("fs");
const axios = require("axios");

http
  .createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    req.on("data", chunk => {
      const payload = JSON.parse(chunk);
      payload.commits.map(item => getCommitDiff(item, payload.repository));
    });
    res.write(req.url);
    res.end("Hello world");
  })
  .listen(8001);

const getCommitDiff = ({ id }, { full_name }) => {
  axios(`https://api.github.com/repos/${full_name}/commits/${id}`).then(e =>
    fs.appendFile(`${id}Commit.json`, JSON.stringify(e.data), q => {
      if (q) throw q;
      console.log(`Saved commit: ${e.data.commit.message}`);
    })
  );
};
