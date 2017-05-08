
Set of libraries to create well-written [TypeScript](https://github.com/Microsoft/TypeScript) applications with [Node](https://nodejs.org/en/) and/or Browser.

The set is based on known projects, such as [Koa](https://github.com/koajs/koa) and [React](https://github.com/facebook/react).

o *l* y is not a framework nor boilerplate and you should probably stay away from it.

---- 

```typescript
import { Kernel } from "oly-core";

Kernel
  .create({/** STORE **/})
  .with(
    /** PROVIDERS **/
  )
  .start();

```

# Requirements

0. Install [Node.js](https://nodejs.org/en/).

1. Create a TypeScript project.
```bash
npm i -g typescript
tsc --init
```
2. Enable decorators in your `tsconfig.json`.
```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "jsx": "react"
  }
}
```

That's it.

> There's more stuffs about TypeScript [here](https://www.typescriptlang.org/docs/tutorial.html).
