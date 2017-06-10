import { Kernel } from "oly-core";

describe("myLittleTest", () => {

  const kernel = Kernel.test({A: "B"});

  it("should be okay", () => {
    expect(kernel.state("A")).toBe("B");
  });
});
