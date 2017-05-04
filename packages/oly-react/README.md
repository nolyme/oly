# o*l*y react

```tsx
import "oly-core/polyfill";
import * as React from "react";
import { Kernel } from "oly-core";
import { page, ReactServerProvider } from "oly-react";

class App {
  @page("/") index() {
    return <h1>Hello World</h1>;
  }
}

new Kernel()
  .with(App, ReactServerProvider)
  .start()
```

## Installation

```bash
$ npm install react @types/react oly-core oly-http oly-react 
```

## Configuration

| ENV | Provider | Default | Description |
|-----|----------|---------|-------------|
| **OLY_REACT_ID** | ReactServerProvider, ReactBrowserProvider  | "app" | The DOM id for react render.  |
| **OLY_REACT_SERVER_PREFIX** | ReactServerProvider  | "/" | The prefix router path.  |
| **OLY_REACT_SERVER_POINTS** | ReactServerProvider  | ["www", "http://localhost:8080", "default"] | The (list of) url/path/template to use as index.html.  |
| **OLY_PIXIE_HTTP_ROOT** | PixieHttp  | "" | The base url of pixie http client.  |
