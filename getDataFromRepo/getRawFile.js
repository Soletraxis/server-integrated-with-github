const axios = require("axios");

const getRawFile = file => {
  return axios
    .get(file)
    .then(e => (typeof e.data === "string" ? e.data : JSON.stringify(e.data)));
};

module.exports = getRawFile;
