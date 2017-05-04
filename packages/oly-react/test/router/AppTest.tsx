import * as cheerio from "cheerio";
import { Kernel } from "oly-core";
import { HttpClient, HttpServerProvider } from "oly-http";
import * as React from "react";
import { page } from "../../src/router/decorators/page";
import { path } from "../../src/router/decorators/path";
import { query } from "../../src/router/decorators/query";
import { ReactServerProvider } from "../../src/router/providers/ReactServerProvider";

describe("App", () => {

  class App {
    @page("/") index(@query("name") name: string = "World") {
      return <div>Hello {name}</div>;
    }

    @page("/:name") hi(@path("name") name: string) {
      return <div>Hi {name}</div>;
    }
  }

  const kernel = new Kernel({
    OLY_HTTP_SERVER_PORT: 6970,
    OLY_LOGGER_LEVEL: "ERROR",
    OLY_REACT_SERVER_POINTS: ["default"],
  }).with(App, ReactServerProvider);

  beforeAll(() => kernel.start());
  afterAll(() => kernel.stop());

  it("should read query", async () => {
    const client = kernel.get(HttpClient).with({baseURL: kernel.get(HttpServerProvider).hostname});
    const contentOf = async (url: string) => {
      const {data} = await client.get<string>(url);
      const $ = cheerio.load(data);
      return $("#app").text();
    };
    expect(await contentOf("/")).toBe("Hello World");
    expect(await contentOf("/?name=Jean")).toBe("Hello Jean");
  });

  it("should read path variable", async () => {
    const client = kernel.get(HttpClient).with({baseURL: kernel.get(HttpServerProvider).hostname});
    const contentOf = async (url: string) => {
      const {data} = await client.get<string>(url);
      const $ = cheerio.load(data);
      return $("#app").text();
    };
    expect(await contentOf("/Patrick")).toBe("Hi Patrick");
  });
});
