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

|                                            |                                        |
|:------------------------------------------:|----------------------------------------|
| [CORE](https://noly.me/oly/#/m/oly-core)   | The fundamental.                       | 
| [API](https://noly.me/oly/#/m/oly-api)     | REST Api, Koa, ...                     | 
| [REACT](https://noly.me/oly/#/m/oly-react) | React, SSR and routing.                | 
| [TOOLS](https://noly.me/oly/#/m/oly-tools) | How to use TypeScript in your browser. | 
