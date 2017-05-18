/**
 * @jest-environment jsdom
 */

import { inject, state } from "oly-core";
import { attachKernel } from "oly-test";
import * as React from "react";
import { page } from "../../src";
import { ReactBrowserProvider } from "../../src/router/providers/ReactBrowserProvider";
import { Browser } from "../../src/router/services/Browser";
import { Router } from "../../src/router/services/Router";

class FakeHttp {

  @state("logs") logs: string[] = [];

  fetchSomeData() {
    return Promise.resolve("1+1=3");
  }

  onStart() {
    this.logs.push("Yes, i'm started");
  }
}

class NestedView {
  @page("/yo") yo = () => <div>yo</div>;
}

class NestedAsyncView {
  @inject http: FakeHttp;

  @page("/async")
  async ho() {
    const data = await this.http.fetchSomeData();
    return <h1>{data}</h1>;
  }
}

class App {
  @page("/") index = () => <h1>HI</h1>;

  @page("/nested", {children: [NestedAsyncView, NestedView]})
  module() {
    return ({children}: { children: any }) => <div>MENU{children}</div>;
  }
}

describe("ReactBrowserProvider", () => {

  const kernel = attachKernel().with(App, ReactBrowserProvider);
  const router = kernel.get(Router);
  const browser = kernel.get(Browser);

  it("should inject dependencies", async () => {
    await router.navigate("/");
    expect(kernel.state("logs")[0]).toBe("Yes, i'm started");
    expect(browser.root.textContent).toBe("HI");
  });

  it("should support nested & resolvers", async () => {
    await router.navigate("/nested/async");
    expect(browser.root.textContent).toBe("MENU1+1=3");
    await router.navigate("/nested/yo");
    expect(browser.root.textContent).toBe("MENUyo");
  });
});
