const {createConfiguration, loaders} = require("oly-tools");

module.exports = (env) => {

  const config = createConfiguration({
    entry: [
      "oly/polyfill",
      "./src/client/main.browser.ts",
      "./src/client/main.scss",
    ],
    hash: false,
    assets: "./src/client/assets",
    template: "./src/client/index.html",
    env,
    styleLoader: loaders.sassLoaderFactory(),
    sourceMaps: "source-map",
  });

  return config;
};
