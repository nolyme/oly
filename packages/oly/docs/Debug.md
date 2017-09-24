# Debug

## Console

```ts
import { Kernel, Global } from "oly";

Kernel
  .create()
  .start()
  .then(k => Global.set("kernel", k));
  
// now Kernel is accessible to
// browser: window.oly.kernel
// nodejs: global.oly.kernel
```


