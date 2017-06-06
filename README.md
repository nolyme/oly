# o *l* y

🦊 Set of libraries to create well-written [TypeScript](https://github.com/Microsoft/TypeScript) applications with [Node](https://nodejs.org/en/) and/or Browser.

The set is based on known projects, such as [Koa](https://github.com/koajs/koa) and [React](https://github.com/facebook/react).

o *l* y isn't a framework nor boilerplate and you should probably stay away from it.

```typescript
import { Kernel } from "oly";

Kernel
  .create({/** STORE **/})
  .with(
    /** PROVIDERS **/
  )
  .start()
  .catch(console.error);
```
