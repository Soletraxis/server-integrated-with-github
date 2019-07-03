const reduceFilesToOneArray = files => {
  return files.reduce((acc, item) => {
    if (Array.isArray(item)) {
      return [...acc, ...reduceFilesToOneArray(item)];
    } else {
      return [...acc, item];
    }
  }, []);
};

module.exports = reduceFilesToOneArray;
