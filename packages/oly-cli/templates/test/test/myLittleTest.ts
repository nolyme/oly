import { Kernel } from "oly-core";

describe("myLittleTest", () => {

  const kernel = Kernel.create({A: "B"});

  beforeAll(() =>
    kernel.start());

  it("should be okay", () => {
    expect(kernel.state("A")).toBe("B");
  });
});
