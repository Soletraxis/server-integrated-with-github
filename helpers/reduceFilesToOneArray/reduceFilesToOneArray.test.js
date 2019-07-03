const reduceFilesToOneArray = require("./reduceFilesToOneArray");

test("Reducing [[[1, 2]], 3]", () => {
  expect(reduceFilesToOneArray([[[1, 2]], 3])).toEqual([1, 2, 3]);
});
test("Reducing [[[a, b]], c]",() =>{
    expect(reduceFilesToOneArray([[['a', 'b']], 'c'])).toEqual(['a', 'b', 'c']);
})