import { Exception, Global, Kernel, state } from "oly";
import { retry } from "oly-retry";
import { olyQueueErrors, Publisher, QueueProvider, task, WorkerProvider } from "../src";

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

describe("QueueProvider", () => {

  class Tasks {
    @state counter = 0;
    @state counter2 = 0;
    @state errors = 0;

    @task add(data: number) {
      this.counter += data;
      return this.counter;
    }

    @task({name: "calc"})
    calc({x, y}: { x: number; y: number }) {
      return x + y;
    }

    @task({concurrency: 1})
    async long() {
      await Global.timeout(100);
    }

    @task({concurrency: 3})
    async long2() {
      await Global.timeout(100);
    }

    @task({name: "waaa"})
    async fail() {
      await Global.timeout(10);
      throw new Exception("sorry");
    }

    @task
    @retry({
      attempts: 100,
      when: [Exception],
    })
    async tryAgain(n: number) {
      this.errors += n;
      if (this.errors < 2) {
        throw new Exception("Again");
      }
    }
  }

  const kernel = Kernel.create()
    .with(QueueProvider)
    .with(WorkerProvider, Tasks);
  const publisher = kernel.get(Publisher);

  beforeEach(() => publisher.purge());
  afterEach(() => publisher.purge());

  it("basic", async () => {
    expect(kernel.state("Tasks.counter")).toBe(0);
    const job = await publisher.push("Tasks.add", 1);
    await job.finished();
    expect(kernel.state("Tasks.counter")).toBe(1);
  });

  it("result", async () => {
    expect(
      await publisher.wait(await publisher.push("calc", {x: 2, y: 4})),
    ).toBe(6);
  });

  it("concurrency one", async () => {
    expect(await publisher.queue("Tasks.long")!.count()).toBe(0);
    await Promise.all([
      publisher.push("Tasks.long"),
      publisher.push("Tasks.long"),
      publisher.push("Tasks.long"),
    ]);
    expect((await publisher.queue("Tasks.long")!.getJobCounts()).active).toBe(1);
  });

  it("concurrency multi", async () => {
    expect(await publisher.queue("Tasks.long2")!.count()).toBe(0);
    await Promise.all([
      publisher.push("Tasks.long2"),
      publisher.push("Tasks.long2"),
      publisher.push("Tasks.long2"),
    ]);
    expect((await publisher.queue("Tasks.long2")!.getJobCounts()).active).toBe(3);
  });

  it("error", async () => {
    const job = await publisher.push("waaa");
    await expect(publisher.wait(job)).rejects.toHaveProperty("message", "sorry");
  });

  it("no task", async () => {
    await expect(publisher.push("wtf")).rejects
      .toEqual(new Exception(olyQueueErrors.taskDoesNotExist("wtf")));
  });

  it("with @retry", async () => {
    expect(kernel.state("Tasks.errors")).toBe(0);
    await (await publisher.push("Tasks.tryAgain", 1)).finished();
    expect(kernel.state("Tasks.errors")).toBe(2);
  });
});
