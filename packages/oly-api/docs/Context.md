# Context

Kernel#fork() is called before each request.

```ts
import { inject, Kernel, Logger, state } from "oly";
import { ApiProvider, get } from "oly-api";

export class Controller {
  @inject logger: Logger;
  @inject kernel: Kernel;

  a = 0;        // this is scope-request
  @state b = 0; // this is scope-application

  @get("/") root(ctx) {
  
    ctx.kernel === this.kernel;

    this.a += 1;
    this.b += 1;

    const response = {
      a: this.a,  // always 1 
      b: this.b,  // 1, 2, 3, ...
    };

    // logger shows context id 
    // [data] (contextId) : message
    this.logger.info("response", response);

    return response;
  }
}

Kernel
  .create()
  .with(ApiProvider, Controller)
  .start()
  .catch(console.error);
```
