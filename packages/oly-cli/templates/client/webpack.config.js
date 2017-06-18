const {createConfiguration, loaders} = require("oly-tools");

module.exports = (env) => {

  const config = createConfiguration({
    entry: [
      "oly-core/polyfill",
      "./src/main.browser.ts"
    ],
    env,
  });

  return config;
};
