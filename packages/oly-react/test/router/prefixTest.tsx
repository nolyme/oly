import * as cheerio from "cheerio";
import { Kernel } from "oly";
import * as React from "react";
import { renderToString } from "react-dom/server";
import { AppContext } from "../../src/core/components/AppContext";
import { View } from "../../src/router/components/View";
import { page } from "../../src/router/decorators/page";
import { ReactRouterProvider } from "../../src/router/providers/ReactRouterProvider";
import { Router } from "../../src/router/services/Router";

describe("REACT_ROUTER_PREFIX", () => {

  class Child {
    @page("/b")
    b() {
      return "FINE";
    }
  }

  class App {
    @page("/")
    home() {
      return "OK";
    }

    @page({
      path: "/a",
      children: [Child],
    })
    child() {
      return <View/>;
    }

    @page("/*")
    notFound() {
      return "FAIL";
    }
  }

  describe("without hash", () => {
    const k = Kernel
      .create({REACT_ROUTER_PREFIX: "/toto"})
      .with(App);
    const r = k.inject(Router);
    const p = k.inject(ReactRouterProvider);
    const c = () => cheerio.load(renderToString(
      <AppContext kernel={k}>{p.layers[0].chunks.main}</AppContext>)).root();

    it("should go without prefix", async () => {
      await r.go("/wrong/");
      expect(c().text()).toBe("FAIL");
      await r.go("/toto/");
      expect(c().text()).toBe("OK");
      await r.go("/");
      expect(c().text()).toBe("OK");
      await r.go("/a/b");
      expect(c().text()).toBe("FINE");
      await r.go("/toto/a/b");
      expect(c().text()).toBe("FINE");
    });

    it("should find href with prefix", async () => {
      expect(r.href("b")).toBe("/toto/a/b");
      expect(r.href("/")).toBe("/toto/");
    });

    it("should isActive with prefix", async () => {
      await r.go("/a/b");
      expect(c().text()).toBe("FINE");
      expect(r.isActive("b")).toBeTruthy();
      expect(r.isActive("/a/b")).toBeTruthy();
      expect(r.isActive("/toto/a/b")).toBeTruthy();
      expect(r.isActive("/toto/a")).toBeTruthy();
      expect(r.isActive("/toto/a", true)).toBeFalsy();
      expect(r.isActive("/toto/a?toto", true)).toBeFalsy();
    });
  });

  describe("with hash", () => {
    const k = Kernel
      .create({REACT_ROUTER_HASH: true})
      .with(App);
    const r = k.inject(Router);
    const p = k.inject(ReactRouterProvider);
    const c = () => cheerio.load(renderToString(
      <AppContext kernel={k}>{p.layers[0].chunks.main}</AppContext>)).root();

    it("should go without prefix", async () => {
      await r.go("/wrong/");
      expect(c().text()).toBe("FAIL");
      await r.go("/");
      expect(c().text()).toBe("OK");
      await r.go("#/");
      expect(c().text()).toBe("OK");
      await r.go("#/a/b");
      expect(c().text()).toBe("FINE");
      await r.go("#/a/b");
      expect(c().text()).toBe("FINE");
    });

    it("should find href with prefix", async () => {
      expect(r.href("b")).toBe("#/a/b");
      expect(r.href("/")).toBe("#/");
    });

    it("should isActive with prefix", async () => {
      await r.go("/a/b");
      expect(c().text()).toBe("FINE");
      expect(r.isActive("b")).toBeTruthy();
      expect(r.isActive("/a/b")).toBeTruthy();
      expect(r.isActive("#/a/b")).toBeTruthy();
      expect(r.isActive("#/a")).toBeTruthy();
      expect(r.isActive("#/a", true)).toBeFalsy();
    });
  });
});
