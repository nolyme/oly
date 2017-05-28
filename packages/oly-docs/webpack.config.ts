import { createConfiguration, loaders } from "oly-tools";

export default () => {

  const config = createConfiguration({
    entry: [
      "oly-core/polyfill",
      "./src/web/main.ts",
      "./src/web/main.scss",
    ],
    template: "./src/web/index.html",
    styleLoader: loaders.sassLoaderFactory(),
    assets: "./src/web/assets",
  });

  return config;
};
