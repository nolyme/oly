import { Exception, Global, Kernel, state } from "oly";
import { retry } from "oly-retry";
import { Publisher, QueueProvider, task, WorkerProvider } from "../src";
import { olyQueueErrors } from "../src/constants/errors";

describe("QueueProvider", () => {

  class Tasks {
    @state counter = 0;
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
      await Global.timeout(1000);
    }

    @task({concurrency: 3})
    async long2() {
      await Global.timeout(1000);
    }

    @task({unique: true, concurrency: 1})
    async unique() {
      await Global.timeout(1000);
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

  const kernel = Kernel.create().with(WorkerProvider, Tasks);
  const publisher = kernel.get(Publisher);

  beforeEach(() => publisher.purge());
  afterEach(() => publisher.purge());

  it("basic", async () => {
    expect(kernel.state("Tasks.counter")).toBe(0);
    const job = await publisher.push("Tasks.add", 1);
    const result = await publisher.wait(job);
    expect(kernel.state("Tasks.counter")).toBe(1);
    expect(result).toBe(1);
  });

  it("result", async () => {
    expect(
      await publisher.wait(await publisher.push("calc", {x: 2, y: 4})),
    ).toBe(6);
  });

  it("concurrency one", async () => {
    expect((await publisher.getJobs()).length).toBe(0);
    await Promise.all([
      publisher.push("Tasks.long"),
      publisher.push("Tasks.long"),
      publisher.push("Tasks.long"),
    ]);
    expect((await publisher.getJobs()).length).toBe(3);
    expect((await publisher.getJobs("Tasks.long")).length).toBe(1);
    expect((await publisher.getJobs("Tasks.long", "inactive")).length).toBe(2);
  });

  it("concurrency multi", async () => {
    expect((await publisher.getJobs()).length).toBe(0);
    await Promise.all([
      publisher.push("Tasks.long2"),
      publisher.push("Tasks.long2"),
      publisher.push("Tasks.long2"),
    ]);
    expect((await publisher.getJobs()).length).toBe(3);
    expect((await publisher.getJobs("Tasks.long2")).length).toBe(3);
    expect((await publisher.getJobs("Tasks.long2", "inactive")).length).toBe(0);
  });

  it("unique", async () => {
    expect((await publisher.getJobs()).length).toBe(0);
    await publisher.push("Tasks.unique", "ABC");
    await Global.timeout(100);
    await publisher.push("Tasks.unique", "ABC");
    await Global.timeout(100);
    await publisher.push("Tasks.unique", "ABC");
    await Global.timeout(100);
    await publisher.push("Tasks.unique", "ABCD");
    await Global.timeout(100);
    await publisher.push("Tasks.unique", "ABCD");
    await Global.timeout(100);
    expect((await publisher.getJobs()).length).toBe(2);
    expect((await publisher.getJobs("Tasks.unique")).length).toBe(1);
    expect((await publisher.getJobs("Tasks.unique", "inactive")).length).toBe(1);
  });

  it("error", async () => {
    expect((await publisher.getJobs()).length).toBe(0);
    const job = await publisher.push("waaa");
    await expect(publisher.wait(job)).rejects.toBe("sorry");
  });

  it("no task", async () => {
    expect((await publisher.getJobs()).length).toBe(0);
    await expect(publisher.push("wtf")).rejects
      .toEqual(new Exception(olyQueueErrors.taskDoesNotExist("wtf")));
  });

  it("with @retry", async () => {
    expect((await publisher.getJobs()).length).toBe(0);
    expect(kernel.state("Tasks.errors")).toBe(0);
    await publisher.pushAndWait("Tasks.tryAgain", 1);
    expect(kernel.state("Tasks.errors")).toBe(2);
  });
});
