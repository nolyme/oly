# o *l* y

🦊 Set of libraries to create well-written [TypeScript](https://github.com/Microsoft/TypeScript) applications with [Node.js®](https://nodejs.org/en/) and/or Browsers.

The set is based on known projects, such as [Koa](https://github.com/koajs/koa) and [React](https://github.com/facebook/react).

```ts
import { Kernel } from "oly-core";

Kernel
  .create({/** STORE **/})
  .with(
    /** PROVIDERS **/
  )
  .start()
  .catch(console.error);
```

<br/>
<hr/>
<br/>

There are a **lot** of decorators.

<br/>

```ts
import { inject } from "oly-core";
import { page, PixieHttp } from "oly-react";
import { Home } from "./Home";

export class App {

  @inject pixie: PixieHttp;
  
  @page("/")
  async home() {
    const data = await this.pixie.get("/data");
    return <Home data={data} />;
  }
}
```
