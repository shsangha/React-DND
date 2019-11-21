const initCypressMousePositionPlugin = require("cypress-mouse-position/plugin");

module.exports = (on, config) => {
  initCypressMousePositionPlugin(on);
};
