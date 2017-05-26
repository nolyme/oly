/**
 * @jest-environment jsdom
 */
import { _ } from "oly-core";
import { attachKernel } from "oly-test";
import { Browser } from "../../src/router/services/Browser";
import { ReactBrowserProvider } from "../../src/router/services/ReactBrowserProvider";
import { Router } from "../../src/router/services/Router";
import { FakeApp } from "./fixtures";

describe("BrowserReactProvider", () => {

  const kernel = attachKernel()
    .with(FakeApp, ReactBrowserProvider);

  const browser = kernel.get(Browser);
  const router = kernel.get(Router);

  it("should returns home", () => {
    expect(browser.root.textContent).toBe("Layout:Home");
  });

  it("should returns nested", async () => {
    expect(router.current.name).toBe("home");
    await router.go("list");
    expect(router.current.name).toBe("list");
    expect(browser.root.textContent).toBe("Layout:Nested:List");
  });

  it("should returns params", async () => {
    await router.go("details", {id: "1"});
    expect(browser.root.textContent).toBe("Layout:Nested:Details(1)");
  });
});
