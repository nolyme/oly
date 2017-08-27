# o*l*y

Set of libraries to create well-written [TypeScript](https://github.com/Microsoft/TypeScript) applications with [Node.js®](https://nodejs.org/en/) and browsers.

The set is based on hq projects, such as [Koa](https://github.com/koajs/koa) and [React](https://github.com/facebook/react).

### Getting started

|                                                     |                                        |
|----------------------------------------------------:|----------------------------------------|
| [CORE](https://nolyme.github.io/oly/#/m/oly)        | The foundations.                       | 
| [API](https://nolyme.github.io/oly/#/m/oly-api)     | REST api with Koa.                     | 
| [REACT](https://nolyme.github.io/oly/#/m/oly-react) | React, SSR and routing.                | 

#### Install

```bash
$ npm install oly
$ npm install -D typescript
```

#### Config

```bash
$ ./node_modules/.bin/tsc \
  --init --lib dom,es6 --jsx react \
  --emitDecoratorMetadata --experimentalDecorators
```

