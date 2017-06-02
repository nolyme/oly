/**
 * @jest-environment jsdom
 */
import { _ } from "oly-core";
import { attachKernel } from "oly-test";
import { olyReactRouterEvents } from "../../src";
import { Browser } from "../../src/router/services/Browser";
import { ReactBrowserProvider } from "../../src/router/services/ReactBrowserProvider";
import { ReactRouterProvider } from "../../src/router/services/ReactRouterProvider";
import { Router } from "../../src/router/services/Router";
import { FakeApp } from "./fixtures";

describe("BrowserReactProvider", () => {

  const kernel = attachKernel({OLY_LOGGER_LEVEL: "TRACE"})
    .with(FakeApp, ReactBrowserProvider);

  const browser = kernel.get(Browser);
  const router = kernel.get(Router);

  it("should returns home", () => {
    expect(browser.root.textContent).toBe("Layout:Home");
  });

  it("should returns nested", async () => {
    expect(router.current.route.node.name).toBe("home");
    await router.go("list");
    expect(router.current.route.node.name).toBe("list");
    expect(browser.root.textContent).toBe("Layout:Nested:List");
  });

  it("should returns params", async () => {
    await router.go({to: "details", params: {id: "1"}, query: {name: "lol"}});
    expect(browser.root.textContent).toBe("Layout:Nested:Details(1,lol)");
  });

  it("should render without conflict", async () => {
    await router.go("victory");
    expect(browser.root.textContent).toBe("Layout:Nested2:Victory");
  });

  it("should use <Go/>", async () => {
    await router.go("back");
    const go: any = browser.root.querySelector("#go");
    go.click();
    await kernel.on(olyReactRouterEvents.TRANSITION_END, _.noop).wait();
    expect(browser.root.textContent).toBe("Layout:Home");
  });

  it("should returns 404", async () => {
    const routerProvider = kernel.get(ReactRouterProvider);
    await routerProvider.transition("/wat");
    expect(browser.root.textContent).toBe("Layout:NotFound");
  });
});
