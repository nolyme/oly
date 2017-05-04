import { equal } from "assert";
import { inject, Kernel } from "oly-core";
import * as React from "react";
import { page } from "../../src";
import { ReactBrowserProvider } from "../../src/router/providers/ReactBrowserProvider";
import { BrowserMock } from "../../src/router/services/BrowserMock";

describe("ReactBrowserProvider", () => {

  const checker: string[] = [];

  class FakeHttp {
    fetchSomeData() {
      return Promise.resolve("1+1=3");
    }

    onStart() {
      checker.push("Yes, i'm started");
    }
  }

  class NestedView {
    @page("/yo") yo = () => <div>yo</div>;
  }

  class NestedAsyncView {
    @inject http: FakeHttp;
    @page("/async") ho = async () => {
      const data = await this.http.fetchSomeData();
      return <h1>{data}</h1>;
    }
  }

  class App {
    @page("/") index = () => <h1>HI</h1>;
    @page("/nested", {children: [NestedAsyncView, NestedView]}) module = () => {
      return ({children}: { children: any }) => <div>MENU{children}</div>;
    }
  }

  const kernel = new Kernel({OLY_LOGGER_LEVEL: "ERROR"});
  const browser = kernel.get(BrowserMock);

  kernel.with(App, NestedAsyncView, ReactBrowserProvider);

  it("should inject dependencies", async () => {
    equal(checker[0], null);
    await kernel.start();
    equal(checker[0], "Yes, i'm started");
    equal(browser.html, "<h1>HI</h1>");
  });

  it("should support nested & resolvers", async () => {
    await browser.open("/nested/async");
    equal(browser.html, "<div>MENU<h1>1+1=3</h1></div>");
    await browser.open("/nested/yo");
    equal(browser.html, "<div>MENU<div>yo</div></div>");
  });
});
