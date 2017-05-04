# o*l*y test

Helpers for oly+jest.

```typescript
import { Logger, inject } from "oly-core";
import { test } from "oly-test";

export class AppTest {
  @inject logger: Logger;
  
  @test something() {
    this.logger.info("say something");
    expect(true).toBe(true);
  }
}
```

## Installation

```bash
$ npm install oly-core oly-test
```
