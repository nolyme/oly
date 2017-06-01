import { _ } from "oly-core";
import { attachKernel } from "oly-test";
import { CronProvider } from "../src/CronProvider";
import { cron } from "../src/decorators/cron";

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

  attachKernel().with(App, CronProvider);

  it("should tick once", async () => {
    await _.timeout(2200);
    expect(stack.length).toBeGreaterThanOrEqual(2);
  });
});
