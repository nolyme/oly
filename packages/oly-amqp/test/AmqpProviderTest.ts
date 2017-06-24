import { _, Exception, Kernel } from "oly-core";
import { task } from "../src";
import { IMessage } from "../src/interfaces";
import { AmqpProvider } from "../src/providers/AmqpProvider";
import { WorkerProvider } from "../src/providers/WorkerProvider";
import { AmqpClient } from "../src/services/AmqpClient";

describe("AmqpProvider", () => {

  class Tasks {
    static stack: IMessage[] = [];

    @task
    abc(message: IMessage) {
      if (Tasks.stack.length === 1) {
        throw new Exception("boom");
      }
      Tasks.stack.push(message);
    }
  }

  Kernel.create().with(WorkerProvider, Tasks);

  const kernel = Kernel.create();
  const client = kernel.inject(AmqpClient);

  it("should publish messages", async () => {
    await client.purge("Tasks.abc");
    await client.publish("Tasks.abc", "Hello");
    await client.publish("Tasks.abc", "Hello");
    await _.timeout(50);
    expect(Tasks.stack.length).toBe(1);
    expect(Tasks.stack[0].properties.correlationId).toBe(kernel.id);
    expect(Tasks.stack[0].content.toString("UTF-8")).toBe("Hello");
  });
});
