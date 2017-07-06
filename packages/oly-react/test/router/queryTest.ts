import * as cheerio from "cheerio";
import { Kernel } from "oly-core";
import { renderToString } from "react-dom/server";
import { IHrefQuery, ILayer } from "../../src/router";
import { page } from "../../src/router/decorators/page";
import { query } from "../../src/router/decorators/query";
import { ReactRouterProvider } from "../../src/router/providers/ReactRouterProvider";
import { Router } from "../../src/router/services/Router";

describe("@query", () => {

  class A {

    @page("/") a(@query b: string) {
      return `A ${typeof b} ${b}`;
    }

    @page("/b") b(@query b: boolean) {
      return `A ${typeof b} ${b}`;
    }

    @page("/c") c(@query b: number) {
      return `A ${typeof b} ${b}`;
    }

    @page("/d") d(@query a: object) {
      return `A ${typeof a} ${JSON.stringify(a)}`;
    }
  }

  const k = Kernel.create().with(A);
  const r = k.inject(ReactRouterProvider);
  const o = k.inject(Router);
  const $ = (l: ILayer) => cheerio.load(renderToString(l.chunks.main)).root();
  const t = (url: string | IHrefQuery) => {
    r.layers = [];
    return o.go(url);
  };

  it("should extract query from url", async () => {
    await t("/?b=c");
    expect($(r.layers[0]).text()).toBe("A string c");
  });

  it("should parse boolean if needed", async () => {
    await t("/b?b=true");
    expect($(r.layers[0]).text()).toBe("A boolean true");
    await t("/b?b=1");
    expect($(r.layers[0]).text()).toBe("A boolean true");
    await t("/b?b");
    expect($(r.layers[0]).text()).toBe("A boolean true");
    await t("/b");
    expect($(r.layers[0]).text()).toBe("A boolean false");
    await t("/b?b=0");
    expect($(r.layers[0]).text()).toBe("A boolean false");
  });

  it("should parse number if needed", async () => {
    await t("/c?b=1");
    expect($(r.layers[0]).text()).toBe("A number 1");
    await t("/c?b");
    expect($(r.layers[0]).text()).toBe("A undefined undefined");
    await t("/c");
    expect($(r.layers[0]).text()).toBe("A undefined undefined");
  });

  it("should parse an object", async () => {
    await t({to: "/d", query: {a: {b: {c: "d"}}}});
    expect($(r.layers[0]).text()).toBe(`A object {"b":{"c":"d"}}`);
  });
});
