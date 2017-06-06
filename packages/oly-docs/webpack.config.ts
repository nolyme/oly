import { createConfiguration, loaders } from "oly-tools";

export default (env: string = "development") => {

  const config: any = createConfiguration({
    entry: ["./src/main.browser.ts"],
    template: "./src/web/index.html",
    assets: "./src/web/assets",
    production: env === "production",
    styleLoader: loaders.sassLoaderFactory(),
  });

  config.context = __dirname;

  delete config.output.publicPath;

  return config;
};
