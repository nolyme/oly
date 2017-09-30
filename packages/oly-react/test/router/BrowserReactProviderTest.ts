/**
 * @jest-environment jsdom
 */
import { autoAttach } from "../../src/core/configuration";

autoAttach();

import { Kernel } from "oly";
import { olyReactRouterEvents } from "../../src/router/constants/events";
import { ReactBrowserProvider } from "../../src/router/providers/ReactBrowserProvider";
import { ReactRouterProvider } from "../../src/router/providers/ReactRouterProvider";
import { Browser } from "../../src/router/services/Browser";
import { Router } from "../../src/router/services/Router";
import { App } from "./fixtures";

describe("BrowserReactProvider", () => {

  const kernel = Kernel.create()
    .with(App, ReactBrowserProvider);

  const browser = kernel.inject(Browser);
  const router = kernel.inject(Router);

  it("should returns home", () => {
    expect(browser.root.textContent).toBe("Layout:Home");
  });

  it("should returns nested", async () => {
    expect(router.current.route.node.name).toBe("home");
    await router.go("users.list");
    expect(router.current.route.node.name).toBe("list");
    expect(browser.root.textContent).toBe("Layout:Users:List");
  });

  it("should returns params", async () => {
    await router.go({to: "details", params: {id: "1"}, query: {name: "lol"}});
    expect(browser.root.textContent).toBe("Layout:Users:Details(1,lol)");
  });

  it("should render without conflict", async () => {
    await router.go("catalog");
    expect(browser.root.textContent).toBe("Layout:Shop");
  });

  it("should use <Go/>", async () => {
    await router.go("back");
    const go: any = browser.root.querySelector("#go");
    go.click();
    await kernel.on(olyReactRouterEvents.TRANSITION_END).wait();
    expect(browser.root.textContent).toBe("Layout:Home");
  });

  it("should returns 404", async () => {
    const routerProvider = kernel.inject(ReactRouterProvider);
    await routerProvider.transition({to: "/wat"});
    expect(browser.root.textContent).toBe("Layout:NotFound");
  });
});
