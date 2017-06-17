const {createConfiguration, loaders} = require("oly-tools");

export default (env) => {

  const config = createConfiguration({
    entry: [
      "oly-core/polyfill",
      "./src/main.browser.ts"
    ],
    assets: "./src/web/assets",
    template: "./src/web/index.html",
    styleLoader: loaders.sassLoaderFactory(),
    env,
  });

  return config;
};
