import { Kernel, Meta, olyCoreKeys } from "oly";
import { array } from "../src/decorators/array";
import { build } from "../src/decorators/build";
import { field } from "../src/decorators/field";

describe("@build", () => {

  const body = (target: any, propertyKey: any, index: number) => {

    Meta.of({key: olyCoreKeys.arguments, target, propertyKey, index}).set({
      handler: (kernel: Kernel) => {
        return kernel.state("Fake.context");
      },
    });
  };

  class Bar {
    @field score: number;
  }

  class Foo {
    @field() name: string;
    @array({of: Bar})
    bars: Bar[];
  }

  class A {
    b(@build c: Foo) {
      return c;
    }
  }

  class B {
    b(@build @body c: Foo) {
      return c;
    }
  }

  const foo: Foo = {
    name: "Jean",
    bars: [
      {score: 1},
      {score: 2},
    ],
  };
  const k = Kernel.create({"Fake.context": foo});

  it("should parse object", () => {
    expect(k.invoke(A, "b", [foo]))
      .toBeInstanceOf(Foo);
    expect(k.invoke(B, "b", []))
      .toBeInstanceOf(Foo);
  });

  it("should validate object", () => {
    expect(() => k.invoke(A, "b", [{}]))
      .toThrow(/Validation has failed/);
  });
});
