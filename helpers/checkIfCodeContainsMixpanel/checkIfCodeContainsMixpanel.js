const checkIfCodeContainsMixpanel = code => {
  return code.toUpperCase().includes("mixpanel".toUpperCase());
};
module.exports = checkIfCodeContainsMixpanel;
