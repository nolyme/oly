import { env } from "../../src/kernel/decorators/env";
import { Kernel } from "../../src/kernel/Kernel";

describe("Env", () => {

  it("should parse nothing", () => {

    const kernel = Kernel.create({
      A: "BCD",
    });

    class Test {
      @env("A") a: any;
    }

    expect(kernel.inject(Test).a).toEqual("BCD");
  });

  it("should parse object", () => {
    const kernel = Kernel.create({
      A: "BCD",
      X: "{\"Y\":\"${A}\"}",
    });

    interface ITest {
      Y: string;
    }

    class Test {
      @env("X") x: ITest;
    }

    expect(kernel.inject(Test).x).toEqual({Y: "BCD"});
  });

  it("should parse array", () => {
    const kernel = Kernel.create({
      A: "[1, 2, 3, 4]",
    });

    class Test {
      @env("A") x: number[];
    }

    expect(kernel.inject(Test).x).toEqual([1, 2, 3, 4]);
  });
});
