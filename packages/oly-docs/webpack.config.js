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

  config.devServer.host = "0.0.0.0";

  delete config.output.publicPath;

  return config;
};
