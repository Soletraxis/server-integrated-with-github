const http = require("http");
const fs = require("fs");

http
  .createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    req.on("data", chunk => {
      fs.appendFile(
        "file.json",
        chunk,
        e => {
          if (e) {
            throw e;
          }
          console.log("Saved!");
        }
      );
    });
    res.write(req.url);
    res.end("Hello world");
  })
  .listen(8001);
