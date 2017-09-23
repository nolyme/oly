<h1 align="center">
  O<em>L</em>Y
</h1>

<p align="center">
o*l*y is a set of libraries to create well-written [TypeScript](https://github.com/Microsoft/TypeScript) applications with [Node.js®](https://nodejs.org/en/) and browsers.
<br/>
<small>This set is based on popular projects, such as [Koa](https://github.com/koajs/koa) and [React](https://github.com/facebook/react).</small>
</p>

<div align="center">
<a href="https://travis-ci.org/nolyme/oly"><img src="https://travis-ci.org/nolyme/oly.svg?branch=master" alt="travis"/></a>
<a href="https://codecov.io/gh/nolyme/oly"><img src="https://codecov.io/gh/nolyme/oly/branch/master/graph/badge.svg" alt="codecov"/></a>
</div>

<hr />

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
| [REACT](https://nolyme.github.io/oly/#/m/oly-react) | React, SSR and Routing.                | 
