import { Exception, Kernel, Time } from "oly-core";
import { CronProvider } from "../src/CronProvider";
import { cron } from "../src/decorators/cron";

describe("CronProvider", () => {

  class App {
    static stack: string[] = [];

    @cron("* * * * * *")
    repeat() {
      App.stack.push("OK");
      if (App.stack.length === 1) {
        throw new Exception("Fail!");
      }
    }
  }

  const kernel = Kernel.create().with(App, CronProvider);
  const time = kernel.inject(Time);

  time.global().pause();

  it("should tick once", async () => {
    expect(App.stack.length).toBe(0);
    time.travel(1000);
    expect(App.stack.length).toBe(1);
    time.travel(1000);
    expect(App.stack.length).toBe(2);
  });
});
