# o*l*y queue

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

### Installation

```
$ npm install oly-core oly-queue
```

### Configuration

| ENV | Provider | Default | Description |
|-----|----------|---------|-------------|
| **OLY_QUEUE_URL** | AmqpProvider | "amqp://localhost" | The URI connection to RabbitMQ.  |
| **OLY_QUEUE_CONCURRENCY** | AmqpProvider | 1 | The default prefetch.  |
| **OLY_QUEUE_RETRY_DELAY** | WorkerProvider | 1000 | The time before each retry in ms.  |
