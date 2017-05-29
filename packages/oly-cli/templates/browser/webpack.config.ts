import { createConfiguration } from "oly-tools/webpack";

export default (env?: string) => {

  const config = createConfiguration({
    entry: "./src/main.browser.ts",
    nyan: true,
    open: true,
    production: env === "production",
  });

  return config;
};
