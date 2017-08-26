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
import { inject } from "oly";
import { page } from "oly-react";
import { HttpClient } from "oly-http";
import { Home } from "./Home";

export class App {

  @inject http: HttpClient;

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
import { Kernel } from "oly";
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
import { Kernel } from "oly";
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
