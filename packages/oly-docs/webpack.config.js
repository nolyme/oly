const {createConfiguration, loaders} = require("oly-tools");

module.exports = (env) => {

  const config = createConfiguration({
    entry: [
      "oly-core/polyfill",
      "./src/client/main.browser.ts",
      "./src/client/styles/main.scss"
    ],
    dist: __dirname + "/out/www",
    assets: "./src/client/assets",
    template: "./src/client/index.html",
    styleLoader: loaders.sassLoaderFactory(),
    env,
  });

  return config;
};
