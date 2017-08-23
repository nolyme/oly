import * as cheerio from "cheerio";
import { Kernel } from "oly-core";
import { HttpClient, HttpServerProvider } from "oly-http";
import { ReactServerProvider } from "../../src/server/providers/ReactServerProvider";
import { Cookies } from "../../src/server/services/Cookies";
import { CookiesApp } from "./fixtures/CookiesApp";

describe("Cookies", () => {

  const kernel = Kernel.create({HTTP_SERVER_PORT: 19223}).with(CookiesApp, ReactServerProvider);
  const http = kernel.inject(HttpClient).with({
    baseURL: kernel.inject(HttpServerProvider).hostname,
  });
  const request = (url: string) => http.get<string>(url).then((data) => cheerio
    .load(data)("body").text().trim());

  it("should be ok with server", async () => {
    expect(await request("/")).toBe("OK:undefined");
  });
});
