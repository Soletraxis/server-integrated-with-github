const reduceFilesToOneArray = files => {
  return files.reduce((acc, item) => {
    if (item.length !== undefined) {
      return [...acc, ...reduceFilesToOneArray(item)];
    } else {
      return [...acc, item];
    }
  }, []);
};

module.exports = reduceFilesToOneArray;
