import * as cheerio from "cheerio";
import { Kernel } from "oly-core";
import { HttpClient, HttpServerProvider } from "oly-http";
import * as React from "react";
import { page } from "../../src/router/decorators/page";
import { ReactServerProvider } from "../../src/router/providers/ReactServerProvider";

/**
 *
 */
describe("ReactProxyTest", () => {

  class App {
    @page("/") index = () => <div id="test">OK</div>;
  }

  const client = new Kernel({
    OLY_HTTP_SERVER_PORT: 2049,
    OLY_LOGGER_LEVEL: "ERROR",
    OLY_REACT_SERVER_POINTS: ["default"],
  }).with(ReactServerProvider, App);
  const server = new Kernel({
    OLY_LOGGER_LEVEL: "ERROR",
    OLY_REACT_SERVER_POINTS: [client.get(ReactServerProvider).hostname],
  }).with(ReactServerProvider, App);

  beforeAll(async () => {
    await client.start();
    await server.start();
  });

  afterAll(async () => {
    await client.stop();
    await server.stop();
  });

  it("should use proxy", async () => {
    client.get(HttpServerProvider).use(async (ctx, next) => {
      if (!!ctx.req.url && ctx.req.url.indexOf(".") > -1) {
        ctx.body = "fake-binary-data";
      } else {
        await next();
      }
    });

    const http = client.get(HttpClient).with({baseURL: server.get(ReactServerProvider).hostname});
    const $ = cheerio.load((await http.get<string>("/")).data);
    expect($("#app").text()).toBe("OK");
    expect((await http.get<string>("/app.css")).data).toBe("fake-binary-data");
  });
});
