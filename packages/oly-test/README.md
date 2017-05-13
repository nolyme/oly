# o*l*y test

```typescript
// DummyTest.ts
import { Logger, inject } from "oly-core";
import { check } from "oly-test";

export class DummyTest {
  @inject logger: Logger;
  
  @check typeOfLoggerInfo() {
    expect(typeof this.logger.info)
      .toBe("function");
  }
}
```
