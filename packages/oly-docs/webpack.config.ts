import { createConfiguration, loaders } from "oly-tools";

export default () => {

  const config = createConfiguration({
    entry: ["./src/main.browser.ts"],
    template: "./src/web/index.html",
    styleLoader: loaders.sassLoaderFactory(),
    assets: "./src/web/assets",
    nyan: true,
  });

  return config;
};
