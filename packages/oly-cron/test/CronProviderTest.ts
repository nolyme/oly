import { _, inject } from "oly-core";
import { attachKernel } from "oly-test";
import { cron } from "../src";
import { CronProvider } from "../src/CronProvider";

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

describe("CronProvider", () => {

  attachKernel().with(Mockery, App);

  it("should tick once", async () => {
    await _.timeout(250);
    expect(stack.length).toBeGreaterThanOrEqual(3);
  });
});
