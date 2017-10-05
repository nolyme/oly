# o*l*y queue

```ts
import { task, WorkerProvider, Publisher } from "oly-queue";

class App {
  @task add({x, y}) {
    return x + y;
  }
}

const kernel = Kernel.create().with(App, WorkerProvider);
const publisher = kernel.get(Publisher);

await kernel.start();
const job = await publisher.push("App.add", {x: 1, y: 2});
const result = await publisher.wait(job);
```
