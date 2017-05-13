# o*l*y api

```typescript
import { get, ApiProvider } from "oly-api";
import { Kernel } from "oly-core";

class App {
  
  @get("/") 
  index() {
    return {
      hello: "world"
    };
  }
}

new Kernel()
  .with(App, ApiProvider)
  .start();
```

## Installation

```bash
$ npm install oly-core oly-mapper oly-http oly-api
```

## Configuration

| ENV | Provider | Default | Description |
|-----|----------|---------|-------------|
| **OLY_API_PREFIX** | ApiProvider | "/api" | The global api prefix.  |
