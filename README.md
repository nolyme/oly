# o*l*y

o*l*y is a set of libraries to create well-written [TypeScript](https://github.com/Microsoft/TypeScript) applications with [Node.js®](https://nodejs.org/en/) and browsers.

This set is based on popular projects, such as [Koa](https://github.com/koajs/koa) and [React](https://github.com/facebook/react).

```ts
import { Kernel } from "oly";

Kernel
  .create(/* store */)
  .with(/* services & providers */)
  .start()
  .catch(console.error)
```

### Getting started

|                                                     |                                        |
|----------------------------------------------------:|----------------------------------------|
| [CORE](https://nolyme.github.io/oly/#/m/oly)        | Foundations.                           | 
| [API](https://nolyme.github.io/oly/#/m/oly-api)     | REST API, Koa.                         | 
| [REACT](https://nolyme.github.io/oly/#/m/oly-react) | React, SSR and routing.                | 
| [TOOLS](https://nolyme.github.io/oly/#/m/oly-tools) | Webpack, TypeScript.                   | 
