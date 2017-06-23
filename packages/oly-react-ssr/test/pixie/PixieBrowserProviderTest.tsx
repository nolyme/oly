/**
 * @jest-environment jsdom
 */
import { Kernel } from "oly-core";
import { PixieBrowserProvider } from "../../src/pixie/providers/PixieBrowserProvider";
import { Pixie } from "../../src/pixie/services/Pixie";

describe("PixieBrowserProvider", () => {

  window["__pixie__"] = {// tslint:disable-line
    a: "b",
  };

  class FakeApp {
  }

  const kernel = Kernel.create()
    .with(FakeApp, PixieBrowserProvider);

  const pixie = kernel.inject(Pixie);

  it("should", () => {
    expect(pixie.get("a")).toBe("b");
  });
});
