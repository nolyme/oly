import * as cheerio from "cheerio";
import { Kernel } from "oly-core";
import { HttpClient } from "oly-http";
import * as React from "react";
import { Helmet } from "react-helmet";
import { HelmetServerProvider } from "../../src/helmet/HelmetServerProvider";
import { page } from "../../src/router/decorators/page";
import { ReactServerProvider } from "../../src/router/providers/ReactServerProvider";

describe("HelmetServiceProvider", () => {

  class Router {
    @page("/") index = () => (
      <div>
        top
        <Helmet>
          <html lang="en"/>
          <title>Hello</title>
          <meta name="description" content="This is cool"/>
          <body className="root"/>
        </Helmet>
        bottom
      </div>
    )
  }

  const kernel = new Kernel({
    OLY_HTTP_SERVER_PORT: 4059,
    OLY_LOGGER_LEVEL: "ERROR",
    OLY_REACT_SERVER_POINTS: ["default"],
  }).with(Router, HelmetServerProvider);

  beforeAll(() => kernel.start());
  afterAll(() => kernel.stop());

  it("should insert html, body, meta, title", async () => {

    const client = kernel.get(HttpClient).with({
      baseURL: kernel.get(ReactServerProvider).hostname,
    });
    const {data} = await client.get<string>("/");
    const $ = cheerio.load(data);

    expect($("title").text()).toBe("Hello");
    expect($("html").attr("lang")).toBe("en");
    expect($("body").attr("class")).toBe("root");
    expect($('meta[name="description"]').attr("content")).toBe("This is cool");
    expect($('div[id="app"] div').text()).toBe("topbottom");
  });
});
