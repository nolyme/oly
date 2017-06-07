# o *l* y

🦊 Set of libraries to create well-written [TypeScript](https://github.com/Microsoft/TypeScript) applications with [Node.js®](https://nodejs.org/en/) and/or Browser.

The set is based on known projects, such as [Koa](https://github.com/koajs/koa) and [React](https://github.com/facebook/react).

o *l* y isn't a framework nor boilerplate.

<br/>

```typescript
import { Kernel } from "oly/core";

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

```jsx
import { page } from "oly/react";

export class App {
  
  @page index() {
    return <div>Hi!</div>;
  }
}
```
