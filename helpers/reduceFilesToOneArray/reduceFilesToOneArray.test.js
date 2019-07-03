const reduceFilesToOneArray = require("./reduceFilesToOneArray");

test("Reducing [[[a, b]], c]", () => {
  expect(reduceFilesToOneArray([[[1, 2]], 3])).toEqual([1, 2, 3]);
});
