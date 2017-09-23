# Example

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
import { page, PixieHttp } from "oly-react";
import { Home } from "./Home";

export class ReactApp {
  @inject http: PixieHttp;

  @page("/")
  async home() {
    const news = await this.http.get("/data");
    return <Home news={news} />;
  }
}
```

Now, we need some data.
```ts
import { get } from "oly-api";

export class Api {
  
  @get("/data") data() {
    return ["A", "B", "C"];
  }
}
```

At last, we need our entries: main.browser.ts
```ts
import { Kernel } from "oly";
import { ReactBrowserProvider } from "oly-react";
import { ReactApp } from "./ReactApp";

Kernel
  .create()
  .with(ReactApp, ReactBrowserProvider)
  .start()
  .catch(console.error);
```

And: main.server.ts
```ts
import { Kernel } from "oly";
import { ApiProvider } from "oly-api";
import { ReactServerProvider } from "oly-react";
import { ReactApp } from "./ReactApp";
import { Api } from "./Api";

Kernel
  .create()
  .with(ReactApp, ReactServerProvider)
  .with(Api, ApiProvider)
  .start()
  .catch(console.error);
```
