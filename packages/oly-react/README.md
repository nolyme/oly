# o*l*y react

```typescript jsx
import "oly-core/polyfill";
import * as React from "react";
import { Kernel } from "oly-core";
import { page, ReactBrowserProvider } from "oly-react";

class App {
  @page("/") index() {
    return <h1>Hello World</h1>;
  }
}

new Kernel()
  .with(App, ReactBrowserProvider)
  .start()
```
