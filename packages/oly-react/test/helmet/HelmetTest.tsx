import * as cheerio from "cheerio";
import { Kernel } from "oly";
import { HttpClient } from "oly-http";
import * as React from "react";
import Helmet from "react-helmet";
import { page } from "../../src/router/decorators/page";
import { ReactServerProvider } from "../../src/server/providers/ReactServerProvider";

describe("HelmetTest", () => {

  class AppTest {
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

  const kernel = Kernel.create({
    HTTP_SERVER_PORT: 4059,
    REACT_SERVER_POINTS: ["DEFAULT"],
  }).with(AppTest);

  const client = kernel.inject(HttpClient).with({
    baseURL: kernel.inject(ReactServerProvider).hostname,
  });

  it("should insert html, body, meta, title", async () => {

    const data = await client.get<string>("/");
    const $ = cheerio.load(data);

    expect($("html").attr("lang")).toBe("en");
    expect($("body").attr("class")).toBe("root");
    expect($("title").text()).toBe("Hello");
    expect($("meta[name=\"description\"]").attr("content")).toBe("This is cool");
    expect($("div[id=\"app\"] div").text()).toBe("topbottom");
  });
});
