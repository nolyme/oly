# o *l* y

Set of libraries to create well-written [TypeScript](https://github.com/Microsoft/TypeScript) applications with [Node.js®](https://nodejs.org/en/) and Browsers.

The set is based on known projects, such as [Koa](https://github.com/koajs/koa) and [React](https://github.com/facebook/react).

```ts
import { inject } from "oly-core";
import { page, PixieHttp } from "oly-react";
import { Home } from "./Home";

export class App {

  @inject http: PixieHttp;

  @page("/")
  async home() {
    const news = await this.http.get("/news");
    return <Home news={news} />;
  }
}
```

### Getting started

 - [oly-core](https://noly.me/oly/#/m/oly-core)   Take a look on the fundamental of o*l*y.
 - [oly-api](https://noly.me/oly/#/m/oly-api)     Make REST api with Koa and o*l*y.  
 - [oly-react](https://noly.me/oly/#/m/oly-react) Find more information about o*l*y, SSR and React. 
 - [oly-tools](https://noly.me/oly/#/m/oly-tools) Learn more on how to use TypeScript and o*l*y in your browser.
