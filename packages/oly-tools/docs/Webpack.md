### Configuration

An easy way to bundle webapps for all browsers is [Webpack](https://webpack.js.org).

oly-tools has a custom "preset" for TypeScript webapps.

```ts
const { createConfiguration, loaders } = require("oly-tools");

module.exports = (env) => {

  const config = createConfiguration({
    
    env,
    
    entry: [
      "oly/polyfill",
      "./src/main.browser.ts"
    ],
    
    assets: "./src/web/assets",
    
    template: "./src/web/index.html",
    
    styleLoader: loaders.sassLoaderFactory(),
    
    sourceMaps: false,
    
  });

  return config;
};
```

/src/main.browser.ts
```ts
import { Kernel } from "oly";

Kernel
  .create(process.env)
  .with(/* ... */)
  .start();
```

After that, we can build an app like that:

```bash
$ webpack --env.NODE_ENV=production --env.LOGGER_LEVEL=ERROR
```
