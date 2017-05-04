<p align="center"> o *l* y </p>
=

*<p align="center"> 01101111 01101100 01111001 </p>*

**<p align="right">v0.8.12</p>**

----

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

# Family

Yup, most of packages are just wrappers.

| Name | Description | Behind | Browser | 
|-----|----------|---------|-------------|
| [**oly-core**](https://github.com/nolyme/oly/) | di, store, logger  | - | *YES*  |
| [**oly-mapper**](https://github.com/nolyme/oly/) | map, validate, sanitize  | [ajv](https://github.com/epoberezkin/ajv) | *YES*  |
| [**oly-http**](https://github.com/nolyme/oly/) | http client and server providers  | [axios](https://github.com/mzabriskie/axios), [koa](https://github.com/koajs/koa) | *YES*  |
| [**oly-api**](https://github.com/nolyme/oly/) | (REST) api provider | [koa](https://github.com/koajs/koa) | -  |
| [**oly-security**](https://github.com/nolyme/oly/) | api security extension | [bcrypt](https://github.com/kelektiv/node.bcrypt.js), [jwt](https://github.com/auth0/node-jsonwebtoken) | *YES*  |
| [**oly-swagger**](https://github.com/nolyme/oly/) | api swagger extension | - | -  |
| [**oly-orm**](https://github.com/nolyme/oly/) | typeorm provider | [typeorm](https://github.com/typeorm/typeorm) | -  |
| [**oly-queue**](https://github.com/nolyme/oly/) | amqp provider | [amqp.node](https://github.com/squaremo/amqp.node) | -  |
| [**oly-react**](https://github.com/nolyme/oly/) | react client and server provider | [react](https://github.com/facebook/react) | *YES*  |
| [**oly-mongo**](https://github.com/nolyme/oly/) | mongodb provider | [mongodb](https://github.com/mongodb/node-mongodb-native) | -  |

DevDependencies.

| Name | Description | Behind | Browser | 
|-----|----------|---------|-------------|
| [**oly-tools**](https://github.com/nolyme/oly/) | webpack config, tsconfig  | [webpack](https://github.com/webpack/webpack) | -  |
| [**oly-test**](https://github.com/nolyme/oly/) | jest class interface  | [jest](https://github.com/facebook/jest) | -  |
