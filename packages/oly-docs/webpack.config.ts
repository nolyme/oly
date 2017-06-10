import { createConfiguration, loaders } from "oly-tools";

export default (env: any) => {

  const config = createConfiguration({
    entry: "./src/main.browser.ts",
    assets: "./src/web/assets",
    styleLoader: loaders.sassLoaderFactory(),
    env,
  });

  return config;
};
