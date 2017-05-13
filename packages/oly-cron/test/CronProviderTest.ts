import { _, inject, Kernel } from "oly-core";
import { cron } from "../src/annotations";
import { CronProvider } from "../src/CronProvider";

describe("CronProvider", () => {

  let kernel: Kernel;

  afterAll(() => kernel.stop());

  it("should tick once", async () => {

    const stack: any[] = [];

    class App {

      @cron("* * * * * *")
      repeat() {
        stack.push("OK");
        if (stack.length === 2) {
          throw new Error("LOL");
        }
      }
    }

    class Mockery {
      @inject cron: CronProvider;

      onConfigure() {
        (this.cron as any).jobs[0].cronTime.getTimeout = () => 50;
      }
    }

    kernel = new Kernel({OLY_LOGGER_LEVEL: "ERROR"});
    kernel.with(Mockery, App);

    await kernel.start();
    await _.timeout(250);
    await kernel.stop();

    expect(stack.length).toBeGreaterThanOrEqual(3);
  });
});
