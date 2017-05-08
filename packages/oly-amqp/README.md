# o*l*y amqp

o*l*y [amqplib](https://github.com/squaremo/amqp.node).

```ts
import "oly-core/polyfill";
import { inject, Kernel } from 'oly-core';
import { task, WorkerProvider } from 'oly-queue';

class MyJobs {
  @task() doIt() {
    console.log('yeah');
  }
}

new Kernel()
  .with(MyJobs, WorkerProvider)
  .start()
  .then(k => k
    .get(AmpqProvider)
    .publish("MyJobs.doIt"));
```
