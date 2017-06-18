const {createConfiguration, loaders} = require("oly-tools");

module.exports = (env) => {

  const config = createConfiguration({
    entry: [
      "oly-core/polyfill",
      "./src/main.browser.ts",
      "./src/web/styles/main.scss"
    ],
    assets: "./src/web/assets",
    template: "./src/web/index.html",
    styleLoader: loaders.sassLoaderFactory(),
    env,
  });

  return config;
};
