import { Message } from "amqplib";
import { _, inject, Kernel } from "oly-core";
import { task } from "../src";
import { AmqpProvider } from "../src/providers/AmqpProvider";
import { WorkerProvider } from "../src/providers/WorkerProvider";

class Task {
  @inject amqp: AmqpProvider;

  @task({
    assert: {
      messageTtl: 1000,
    },
    name: "TEST",
    priority: 10,
    retry: 4,
  })
  index(payload: any, message: Message) {
    const data = this.amqp.extract(message);
    if (payload.WUT === 2 && data.attempts < 2) {
      throw new Error("LOL");
    }
    stack.push(payload);
    if (stack.length === 4) {
      k2.emit("END");
    }
  }
}

const stack: any[] = [];
const k1 = new Kernel({
  OLY_LOGGER_LEVEL: "ERROR",
  OLY_QUEUE_RETRY_DELAY: 10,
}).with(Task, WorkerProvider);

const k2 = new Kernel({OLY_LOGGER_LEVEL: "ERROR"}).with(AmqpProvider);

describe("AmqpProvider", () => {

  beforeAll(async () => {
    await k1.start();
    await k2.start();
  });

  afterAll(async () => {
    await k1.stop();
    await k2.stop();
  });

  it("should retry if possible", async () => {

    const amqp = k2.get(AmqpProvider);

    await Promise.all([
      amqp.publish("TEST", {WUT: 1}),
      amqp.publish("TEST", {WUT: 2}),
      amqp.publish("TEST", {WUT: 3}),
      amqp.publish("TEST", {WUT: 4}),
    ]);

    await k2.on("END", _.noop).wait();
    expect(stack.length).toBe(4);
  });

  it("should process all things before timeout", async () => {

    class Loop {
      @task({name: "test.toto"})
      async toto() {
        await _.timeout(200);
      }
    }

    const k = new Kernel({OLY_LOGGER_LEVEL: "ERROR"});
    const p = k.get(AmqpProvider);
    await k.start();
    await p.channel.purgeQueue("test.toto");
    for (let i = 0; i < 100; i++) {
      await p.publish("test.toto");
    }
    const w = new Kernel({OLY_QUEUE_CONCURRENCY: 20, OLY_LOGGER_LEVEL: "ERROR"}).with(Loop, WorkerProvider);
    await w.start();
    await w.on("oly:worker:sleep", _.noop).wait();
    await k.stop();
    await w.stop();
  });
});
