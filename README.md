# o*l*y

Set of libraries to create well-written [TypeScript](https://github.com/Microsoft/TypeScript) applications with [Node.js®](https://nodejs.org/en/) and Browsers.

The set is based on known projects, such as [Koa](https://github.com/koajs/koa) and [React](https://github.com/facebook/react).

**This is very experimental.**

### Why

- hide the complexity of server-side rendering
- make code between client/server consistency
- easily and quickly test everything
- unify contexts into one single class

### Overview

We have this react component.
```ts
import * as React from "react";

export interface IHomeProps {
  news: string[];
}

export class Home extends React.Component<IHomeProps, {}> {
  render() {
    return (
      <ul>
        {this.props.news.map((line) => (
          <li>{line}</li>
        ))}
      </ul>
    );
  }
}
```

Maybe, we need to fetch some data before the rendering.
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

Now, we need some news.
```ts
import { get } from "oly-api";

export class Api {
  
  @get("/news") 
  news() {
    return ["A", "B", "C"];
  }
}
```

At last, we need our entries: main.browser.ts
```ts
import { Kernel } from "oly-core";
import { ReactBrowserProvider } from "oly-react";
import { App } from "./App";

Kernel
  .create()
  .with(App, ReactBrowserProvider)
  .start()
  .catch(console.error);
```

And: main.server.ts
```ts
import { Kernel } from "oly-core";
import { ApiProvider } from "oly-api";
import { ReactServerProvider } from "oly-react";
import { App } from "./App";
import { Api } from "./Api";

Kernel
  .create()
  .with(App, ReactServerProvider)
  .with(Api, ApiProvider)
  .start()
  .catch(console.error);
```

### Getting started

|                                            |                                        |
|-------------------------------------------:|----------------------------------------|
| [CORE](https://noly.me/oly/#/m/oly-core)   | The foundations.                       | 
| [API](https://noly.me/oly/#/m/oly-api)     | REST api with Koa    .                 | 
| [REACT](https://noly.me/oly/#/m/oly-react) | React, SSR and routing.                | 
| [TOOLS](https://noly.me/oly/#/m/oly-tools) | How to use TypeScript in browsers.     | 
