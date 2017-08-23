import * as cheerio from "cheerio";
import { Kernel } from "oly-core";
import { HttpClient } from "oly-http";
import { page } from "oly-react";
import * as React from "react";
import { Helmet } from "react-helmet";
import { HelmetServerProvider } from "../../src/helmet/HelmetServerProvider";
import { ReactServerProvider } from "../../src/server/providers/ReactServerProvider";

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
    );
  }

  const kernel = new Kernel({
    HTTP_SERVER_PORT: 4059,
    LOGGER_LEVEL: "ERROR",
    REACT_SERVER_POINTS: ["default"],
  }).with(Router, HelmetServerProvider);

  beforeAll(() => kernel.start());
  afterAll(() => kernel.stop());

  it("should insert html, body, meta, title", async () => {

    const client = kernel.inject(HttpClient).with({
      baseURL: kernel.inject(ReactServerProvider).hostname,
    });
    const data = await client.get<string>("/");
    const $ = cheerio.load(data);

    expect($("title").text()).toBe("Hello");
    expect($("html").attr("lang")).toBe("en");
    expect($("body").attr("class")).toBe("root");
    expect($("meta[name=\"description\"]").attr("content")).toBe("This is cool");
    expect($("div[id=\"app\"] div").text()).toBe("topbottom");
  });
});
