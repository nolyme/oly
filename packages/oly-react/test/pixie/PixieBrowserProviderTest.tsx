/**
 * @jest-environment jsdom
 */
import { Kernel } from "oly";
import { Pixie } from "../../src/pixie/services/Pixie";
import { page } from "../../src/router/decorators/page";
import { ReactBrowserProvider } from "../../src/router/providers/ReactBrowserProvider";

describe("PixieBrowserProvider", () => {

  window["__pixie__"] = {// tslint:disable-line
    a: "b",
  };

  class FakeApp {
    @page home = () => "";
  }

  const kernel = Kernel
    .create()
    .with(FakeApp, ReactBrowserProvider);

  const pixie: Pixie = kernel.inject(Pixie);

  it("should be ok", () => {
    expect(pixie.store.get("a")).toBe("b");
  });
});
