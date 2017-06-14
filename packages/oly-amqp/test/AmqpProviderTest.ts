import { _, Exception, Kernel } from "oly-core";
import { task } from "../src";
import { IMessage } from "../src/interfaces";
import { AmqpProvider } from "../src/providers/AmqpProvider";
import { WorkerProvider } from "../src/providers/WorkerProvider";

describe("AmqpProvider", () => {

  class Tasks {
    static stack: IMessage[] = [];

    @task("abc.queue")
    abc(message: IMessage) {
      if (Tasks.stack.length === 1) {
        throw new Exception("boom");
      }
      Tasks.stack.push(message);
    }
  }

  const kernel = Kernel.create().with(WorkerProvider, Tasks);

  const amqp = kernel.inject(AmqpProvider);

  it("should publish a message", async () => {
    await amqp.purge("abc.queue");
    await amqp.publish("abc.queue", "Hello");
    await amqp.publish("abc.queue", "Hello");
    await _.timeout(500);
    expect(Tasks.stack.length).toBe(1);
    expect(Tasks.stack[0].properties.correlationId).toBe(kernel.id);
    expect(Tasks.stack[0].content.toString("UTF-8")).toBe("Hello");
  });
});
