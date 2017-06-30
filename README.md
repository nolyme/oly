# o*l*y

Set of libraries to create well-written [TypeScript](https://github.com/Microsoft/TypeScript) applications with [Node.js®](https://nodejs.org/en/) and Browsers.

The set is based on known projects, such as [Koa](https://github.com/koajs/koa) and [React](https://github.com/facebook/react).

### Why

- hide the complexity of server-side rendering
- make code between client and server consistency
- easily and quickly test everything
- unify contexts into one single class

### Getting started

|                                            |                                        |
|-------------------------------------------:|----------------------------------------|
| [CORE](https://noly.me/oly/#/m/oly-core)   | The foundations.                       | 
| [API](https://noly.me/oly/#/m/oly-api)     | REST api with Koa.                     | 
| [REACT](https://noly.me/oly/#/m/oly-react) | React, SSR and routing.                | 
yarn
yarn bootstrap -- --hoist
yarn build
yarn lint:ci
yarn test:ci

# bonus
yarn docs -- \
--devtool=false \
--env.NODE_ENV=production \
--env.LOGGER_LEVEL=ERROR

mv docs oly
rsync -aqr --delete-before oly root@noly.me:/var/www/home
