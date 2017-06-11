### Configuration

An easy way to bundle webapps for all browsers is [Webpack](https://webpack.js.org).
However, it's not easy to make a webpack configuration.

oly-tools has a custom "preset" for TypeScript webapps.

*&#60;project&#62;/webpack.config.ts*
```ts
import { createConfiguration, loaders } from "oly-tools";

export default (env) => {

  const config = createConfiguration({
    entry: "./src/main.browser.ts",
    env,
  });

  return config;
};
```

### npm scripts

npm allows us some alias without installing stuff globally.

[https://docs.npmjs.com/misc/scripts](https://docs.npmjs.com/misc/scripts)

*&#60;project&#62;/package.json*
```ts
{
  // ...
  "scripts": {
    "build": "webpack"
  }
}
```

After that, we can build an app like that:

```bash
$ npm run build -- --env.NODE_ENV=production --env.OLY_LOGGER_LEVEL=ERROR
```
