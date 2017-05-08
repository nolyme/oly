## Docs

There are only two classes, **Kernel** and **Logger**. Logger is well named.

Kernel is like a module. It will handle a store, events and relationships between all the application's dependencies.

And most importantly, Kernel properly handles a *context*.

```typescript
import { Kernel, Logger, env, inject } from "oly-core";

class App {
  
  @env("NAME") name: string;
  
  @inject logger: Logger;
  
  onStart() {
    this.logger.info(`Hello ${this.name}`);
  }
}

new Kernel({NAME: "World"})
  .with(App)
  .start();
```
Everything must be in the context of the kernel. Nothing, no data, should get out of the kernel, there is no globals. Everything must be stateless.
