/**
 * @jest-environment jsdom
 */
import { ReactBrowserProvider } from "oly-react";
import { attachKernel } from "oly-test";
import { PixieBrowserProvider } from "../../src/pixie/providers/PixieBrowserProvider";
import { Pixie } from "../../src/pixie/services/Pixie";

describe("PixieBrowserProvider", () => {

  window["__pixie__"] = {// tslint:disable-line
    a: "b",
  };

  class FakeApp {
  }

  const kernel = attachKernel()
    .with(FakeApp, ReactBrowserProvider, PixieBrowserProvider);

  const pixie = kernel.get(Pixie);

  it("should", () => {
    expect(pixie.get("a")).toBe("b");
  });
});
