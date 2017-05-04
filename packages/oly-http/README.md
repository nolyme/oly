# o*l*y http

```ts
import { Kernel } from "oly-core";
import { HttpServerProvider } from "oly-http";

new Kernel()
  .with(HttpServerProvider)
  .start();
```

## Installation

```bash
$ npm install oly-core oly-http
```

## Configuration

| ENV | Provider | Default | Description |
|-----|----------|---------|-------------|
| **OLY_HTTP_SERVER_HOST** | HttpServerProvider | "localhost" | The http server host.  |
| **OLY_HTTP_SERVER_PORT** | HttpServerProvider | 3000 | The http server port.  |
