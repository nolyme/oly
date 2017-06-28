import * as cheerio from "cheerio";
import { inject, Kernel } from "oly-core";
import { HttpClient } from "oly-http";
import { page } from "oly-react";
import * as React from "react";
import { PixieServerProvider } from "../../src/pixie/providers/PixieServerProvider";
import { Pixie } from "../../src/pixie/services/Pixie";
import { ReactServerProvider } from "../../src/server/providers/ReactServerProvider";

class App {

  @inject pixie: Pixie;

  @page("/")
  async index() {
    const data = await this.pixie.fly("dataKey", () => {
      return {name: "World"};
    });
    return <div id="index">Hello {data.name}</div>;
  }
}

describe("PixieServerProvider", () => {

  const kernel = Kernel.create({HTTP_SERVER_PORT: 12029})
    .with(App, PixieServerProvider);
  const server = kernel.inject(ReactServerProvider);
  const client = kernel.inject(HttpClient).with({
    baseURL: server.hostname,
  });

  it("should keep state", async () => {
    const {data: html} = await client.get<string>("/");
    const $ = cheerio.load(html);
    expect($("#index").text()).toBe("Hello World");

    const pixie = JSON.parse($("script")
      .text()
      .replace("window.__pixie__=", ""));
    expect(pixie.dataKey.name).toBe("World");
  });
});
