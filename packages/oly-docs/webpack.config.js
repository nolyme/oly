const {createConfiguration, loaders} = require("oly-tools");

module.exports = (env) => {

  const config = createConfiguration({
    entry: [
      "./node_modules/oly/polyfill/index.js",
      "./src/client/main.browser.ts",
      "./src/client/styles/main.scss"
    ],
    hash: false,
    assets: "./src/client/assets",
    template: "./src/client/index.html",
    styleLoader: loaders.sassLoaderFactory(),
    env,
  });

  return config;
};
