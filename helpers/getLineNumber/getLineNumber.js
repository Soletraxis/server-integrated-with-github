const getLineNumber = (string, subString, allowOverlapping) => {
  string += "";
  subString += "";
  if (subString.length <= 0) return string.length + 1;

  let n = 0,
    pos = 0,
    step = allowOverlapping ? 1 : subString.length;

  while (true) {
    pos = string.indexOf(subString, pos);
    if (pos >= 0) {
      ++n;
      pos += step;
    } else break;
  }
  return n + 1;
};

module.exports = getLineNumber;
