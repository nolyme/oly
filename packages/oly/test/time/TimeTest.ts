import { Global } from "../../src/kernel/Global";
import { Kernel } from "../../src/kernel/Kernel";
import { Time } from "../../src/time/Time";

describe("Time", () => {

  const app = Kernel.create();
  const time: Time = app.get(Time);

  beforeEach(() => time.reset());

  it("should pause time", async () => {

    const now = time.pause();
    await Global.timeout(1);
    expect(now).toBe(time.now());
    time.reset();
    await Global.timeout(1);
    expect(now).not.toBe(time.now());
  });

  it("should control the time", async () => {

    let val = false;
    time.pause();
    time.timeout(() => val = true, 1000);
    expect(val).toBeFalsy();
    time.travel(500);
    expect(val).toBeFalsy();
    time.travel(500);
    expect(val).toBeTruthy();
  });

  it("should work without pause", async () => {

    let val = false;
    time.timeout(() => val = true, 10);
    expect(val).toBeFalsy();
    await Global.timeout(50);
    expect(val).toBeTruthy();
  });
});
