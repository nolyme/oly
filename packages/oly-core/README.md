# [o*l*y](https://github.com/nolyme/oly/) core

```ts
import { env, inject, Kernel } from "oly-core";

class B {
  @env("C") c;
}

class A {
  @inject() b: B;
}

const store = {C: "D"};
const kernel = new Kernel(store);

console.log(kernel.get(A).b.c); // D
```

