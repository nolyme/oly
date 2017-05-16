import { HttpClient } from "oly-http";
import { attachKernel } from "oly-test";
import { ApiProvider } from "../src";
import { olyApiErrors } from "../src/constants/errors";
import { A1, A2, A3, A4 } from "./fixtures";

describe("ApiProvider", () => {

  const kernel = attachKernel({OLY_HTTP_SERVER_PORT: 19219})
    .with(A1, A2, A3, A4);
  const server = kernel.get(ApiProvider);
  const client = kernel.get(HttpClient).with({
    baseURL: server.hostname,
    validateStatus: () => true,
  });
  const fetch = async (path: string, method: string = "get", data = {}) =>
    (await client[method](path, data)).data;

  it("@get", async () => {
    expect(await fetch("/")).toBe("OK");
    expect((await fetch("/azdopazdopakdo")).message).toBe(olyApiErrors.serviceNotFound());
  });
  it("@put", async () => {
    expect(await fetch("/", "put")).toBe("OKput");
  });
  it("@post", async () => {
    expect(await fetch("/", "post")).toBe("OKpost");
  });
  it("@del", async () => {
    expect(await fetch("/", "del")).toBe("OKdel");
  });
  it("@query", async () => {
    expect(await fetch("/query?a=1")).toEqual({a: "1"});
    expect(await fetch("/query")).toEqual({});
  });
  it("@query-required", async () => {
    expect((await fetch("/query/required")).message)
      .toBe(olyApiErrors.missing("queryParam", "a"));
  });
  it("@header", async () => {
    expect(await fetch("/header", "get", {headers: {AuthorIZation: "OKlol"}}))
      .toEqual({a: "OKlol"});
  });
  it("@path", async () => {
    expect(await fetch("/path/toto")).toEqual({a: "toto"});
    expect(await fetch("/pathAsNumber/1")).toEqual({a: 1});
  });
  it("@body", async () => {
    expect(await fetch("/body", "post", {b: "c"})).toEqual({a: {b: "c"}});
  });
  it("@body-parse", async () => {
    expect((await fetch("/body/parse", "post", {b: "c"})).message)
      .toEqual(olyApiErrors.validationHasFailed());
    expect(await fetch("/body/parse", "post", {e: "g", f: [{g: 4}]}))
      .toEqual({a: {e: "g", f: [{g: 4}]}});
  });
  it("@use", async () => {
    expect(kernel.state("counter", 0)).toBe(0);
    await fetch("/a3/");
    expect(kernel.state("counter")).toBe(1);
  });
  it("should always retruns an ApiException", async () => {
    expect((await fetch("/error/raw"))).toEqual({
      message: olyApiErrors.internalError(),
      name: "ApiException",
      status: 500,
    });
  });
});
