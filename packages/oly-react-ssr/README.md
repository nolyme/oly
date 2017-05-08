# o*l*y react ssr

```tsx
import "oly-core/polyfill";
import * as React from "react";
import { Kernel } from "oly-core";
import { page } from "oly-react";
import { ReactServerProvider } from "oly-react-ssr";

class App {
  @page("/") index() {
    return <h1>Hello World</h1>;
  }
}

new Kernel()
  .with(App, ReactServerProvider)
  .start()
```
