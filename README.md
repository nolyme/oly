<h1 align="center">
  O<em>L</em>Y
</h1>

<p align="center">
o<em>l</em>y is a set of libraries to create well-written 
<a href="https://github.com/Microsoft/TypeScript">TypeScript</a>
applications with <a href="https://nodejs.org/en/">Node.js®</a> and browsers.
<br/>
<small>
This set is based on popular projects, such as
<a href="https://github.com/koajs/koa">Koa</a> 
and
<a href="https://github.com/facebook/react">React</a>.
</small>
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
| [CORE](https://nolyme.github.io/oly/#/m/oly)        | Dependency injection, store and event emitter in one place.                           | 
| [API](https://nolyme.github.io/oly/#/m/oly-api)     | REST API with koa and decorators.                         | 
| [REACT](https://nolyme.github.io/oly/#/m/oly-react) | React, SSR and Routing.                | 
