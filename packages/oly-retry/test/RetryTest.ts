import { Exception, Kernel, state } from "oly-core";
import { retry } from "../src/decorators/retry";

describe("Retry", () => {

  class CrashTest {
    @state stack: any[];

    unstack() {
      const e = this.stack.shift();
      if (e instanceof Error) {
        throw e;
      } else {
        return e;
      }
    }

    @retry({
      when: [Exception],
      attempts: 2,
    })
    basic(): string {
      return this.unstack();
    }

    @retry({
      when: [Exception],
      attempts: 2,
    })
    async basicWithPromise(): Promise<string> {
      return this.unstack();
    }

    @retry({
      when: [/hello/],
      attempts: 2,
    })
    regexp(): string {
      return this.unstack();
    }
  }

  it("should retry once and succeed", () => {
    const k = Kernel.create({
      "CrashTest.stack": [
        new Exception("Test"),
        "OK",
      ],
    });
    const test = k.inject(CrashTest);
    expect(test.basic()).toBe("OK");
  });

  it("should retry again and again", () => {
    const kernel = Kernel.create({
      "CrashTest.stack": [
        new Exception("1"),
        new Exception("2"),
        new Exception("3"),
      ],
    });
    const a = kernel.inject(CrashTest);
    expect(() => a.basic()).toThrow("3");
  });

  it("should retry once and succeed with promise", async () => {
    const kernel = Kernel.create({
      "CrashTest.stack": [
        new Exception("Test"),
        "OK",
      ],
    });
    const test = kernel.inject(CrashTest);
    expect(await test.basicWithPromise()).toBe("OK");
  });

  it("should retry again and again with promise", async () => {
    const kernel = Kernel.create({
      "CrashTest.stack": [
        new Exception("p1"),
        new Exception("p2"),
        new Exception("p3"),
      ],
    });
    const test = kernel.inject(CrashTest);
    try {
      await test.basicWithPromise();
      fail("!");
    } catch (e) {
      expect(e.message).toBe("p3");
    }
  });

  it("should use regexp for message error", () => {
    expect(Kernel.create({
      "CrashTest.stack": [
        new Error("hello"),
        "OK",
      ],
    }).inject(CrashTest).regexp()).toBe("OK");
    expect(() => Kernel.create({
      "CrashTest.stack": [
        new Error("hello"),
        new Error("hello"),
        new Error("hello"),
        "OK",
      ],
    }).inject(CrashTest).regexp()).toThrow("hello");
    expect(() => Kernel.create({
      "CrashTest.stack": [
        new Error("snap"),
        "OK",
      ],
    }).inject(CrashTest).regexp()).toThrow("snap");
    expect(() => Kernel.create({
      "CrashTest.stack": [
        new Error(),
        "OK",
      ],
    }).inject(CrashTest).regexp()).toThrow("");
  });
});
