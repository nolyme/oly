const {createConfiguration, loaders} = require("oly-tools");

module.exports = (env) => {

  const config = createConfiguration({
    env,
    entry: [
      "oly/polyfill",
      "./src/client/main.browser.ts",
      "./src/client/main.scss",
    ],
    assets: "./src/client/assets",
    template: "./src/client/index.html",
    styleLoader: loaders.sassLoaderFactory(),
    hash: false,
    sourceMaps: false,
  });

  delete config.output.publicPath;

  return config;
};
