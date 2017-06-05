# Getting Started

```typescript
import { Kernel, Logger } from "oly-core";

const kernel = Kernel.create();
const logger = kernel.get(Logger);

logger.info("Hi!");
```

