import * as cheerio from "cheerio";
import { Kernel } from "oly";
import { HttpClient, HttpServerProvider } from "oly-http";
import * as React from "react";
import { page } from "../../src";
import { ReactServerProvider } from "../../src/server/providers/ReactServerProvider";

/**
 *
 */
describe("ReactProxyTest", () => {

  class App {
    @page("/") index = () => <div id="test">OK</div>;
  }

  const client = Kernel.create({
    HTTP_SERVER_PORT: 22048,
    REACT_SERVER_POINTS: ["default"],
  }).with(ReactServerProvider, App);

  const server = Kernel.create({
    HTTP_SERVER_PORT: 22049,
    REACT_SERVER_POINTS: [client.get(ReactServerProvider).hostname],
  }).with(ReactServerProvider, App);

  const http = client
    .get(HttpClient)
    .with({baseURL: server.get(ReactServerProvider).hostname});

  client.get(HttpServerProvider).use(async (ctx, next) => {
    if (!!ctx.req.url && ctx.req.url.indexOf(".") > -1) {
      ctx.body = "fake-binary-data";
    } else {
      await next();
    }
  });

  it("should use proxy", async () => {
    const $ = cheerio.load((await http.get<string>("/")));
    expect($("#app").text()).toBe("OK");
    expect((await http.get<string>("/app.css"))).toBe("fake-binary-data");
  });
});
