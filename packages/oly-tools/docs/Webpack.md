### Configuration

An easy way to bundle webapps for all browsers is [Webpack](https://webpack.js.org).
However, it's not easy to make a webpack configuration.

oly-tools has a custom "preset" for TypeScript webapps.

```ts
const { createConfiguration, loaders } = require("oly-tools");

module.exports = (env) => {

  const config = createConfiguration({
    entry: [
      "oly/polyfill",
      "./src/main.browser.ts"
    ],
    assets: "./src/web/assets",
    template: "./src/web/index.html",
    styleLoader: loaders.sassLoaderFactory(),
    env,
  });

  return config;
};
```

After that, we can build an app like that:

```bash
$ npm run build -- --env.NODE_ENV=production --env.LOGGER_LEVEL=ERROR
```
