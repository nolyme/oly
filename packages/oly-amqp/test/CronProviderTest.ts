import { _, Kernel } from "oly-core";
import { CronProvider } from "../src/cron/CronProvider";
import { cron } from "../src/cron/decorators/cron";

const stack: any[] = [];

class App {

  @cron("* * * * * *")
  repeat() {
    stack.push("OK");
    if (stack.length === 1) {
      throw new Error("LOL");
    }
  }
}

describe("CronProvider", () => {

  Kernel.create().with(App, CronProvider);

  it("should tick once", async () => {
    await _.timeout(2200);
    expect(stack.length).toBeGreaterThanOrEqual(2);
  });
});
