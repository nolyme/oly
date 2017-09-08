# o*l*y tools

o*l*y tools is a module of the [o*l*y project](https://nolyme.github.io/oly).

Webpack helpers that are perfect for lazy people.

### Installation

```bash
$ npm install -D oly-tools webpack ts-node typescript
```

### Webpack

/webpack.config.ts

```ts
import { createConfiguration } from "oly-tools";

export default (env) => {
  
  const config = createConfiguration({
    env,
    entry: ["./src/main.ts"]
  });
  
  return config;
}
```
