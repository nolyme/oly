import { equal } from "assert";
import { HttpClient, IHttpRequest } from "oly-http";
import { field } from "oly-mapper";
import { attachKernel } from "oly-test";
import { ApiProvider } from "../src";
import { olyApiErrors } from "../src/constants/errors";
import { body } from "../src/decorators/body";
import { del } from "../src/decorators/del";
import { get } from "../src/decorators/get";
import { path } from "../src/decorators/path";
import { post } from "../src/decorators/post";
import { query } from "../src/decorators/query";
import { router } from "../src/decorators/router";
import { HttpServerException } from "../src/exceptions/HttpServerException";

describe("ApiProviderLegacy", () => {
  describe("@get()", () => {

    @router("/hello")
    class MyController {

      @get("/") index = () => "Hello World";

      @get("/:name")
      byName(@path("name") name: string) {
        return `Hello ${name}`;
      }
    }

    const kernel = attachKernel({OLY_HTTP_SERVER_PORT: 2910}).with(MyController);
    const server = kernel.get(ApiProvider);
    const client = kernel.get(HttpClient).with({
      baseURL: server.hostname,
      validateStatus: () => true,
    });

    it("should response correctly", async () => {
      equal((await client.request<HttpServerException>({url: "/"})).data.message,
        olyApiErrors.serviceNotFound());
      equal((await client.request({url: "/hello"})).data, "Hello World");
      equal((await client.request({url: "/hello/jean"})).data, "Hello jean");
    });
  });

  describe("@post()", () => {

    class DataCheck {
      @field() username: string;
      @field() password: string;
    }

    class Data {
      username: string;
      password: string;
    }

    interface IData {
      username: string;
      password: string;
    }

    class MyController {
      @post("/")
      index(@body() data: Data) {
        return data.username;
      }

      @post("/check")
      check(@body(DataCheck) data: DataCheck) {
        return data.username;
      }

      @post("/without")
      without(@body() data: IData) {
        return data.username;
      }

      @del("/")
      remove() {
        return null;
      }
    }

    const kernel = attachKernel({OLY_HTTP_SERVER_PORT: 2911}).with(MyController);
    const server = kernel.get(ApiProvider);
    const client = kernel.get(HttpClient).with({
      baseURL: server.hostname,
      validateStatus: () => true,
    });

    it("should work with data fields", async () => {
      equal((await client.request({
        data: {
          password: "pass",
          username: "Toto",
        },
        method: "POST",
        url: "/check",
      })).data, "Toto");
    });

    it("should work with interface", async () => {
      equal((await client.request({
        data: {
          password: "pass",
          username: "Toto",
        },
        method: "POST",
        url: "/without",
      })).data, "Toto");
    });

    it("should work with class", async () => {
      equal((await client.request({
        data: {
          password: "pass",
          username: "Toto",
        },
        method: "POST",
        url: "/",
      })).data, "Toto");
    });

    it("should work for delete", async () => {
      equal((await client.request({
        method: "DELETE",
        url: "/",
      })).status, 204);
    });
  });

  describe("@query", () => {

    class Data {
      @field() name: string;
    }

    class A {
      @get("/1")
      a1(@query("b") b: string) {
        return {b};
      }

      @get("/2")
      a2(@query("b") b: boolean) {
        return {b};
      }

      @get("/3")
      a3(@query("b") b: number) {
        return {b};
      }

      @get("/4")
      a4(@query("b") b: object) {
        return {b};
      }

      @get("/5")
      a5(@query("b") b: Data) {
        return {b};
      }
    }

    const kernel = attachKernel({OLY_HTTP_SERVER_PORT: 2912}).with(A);
    const server = kernel.get(ApiProvider);
    const client = kernel.get(HttpClient).with({
      baseURL: server.hostname,
      validateStatus: () => true,
    });
    const fetch = async (pathname: string, o: IHttpRequest = {}) =>
      (await client.get<any>("/" + pathname, o)).data;

    it("should extract query as string", async () => {
      expect(await fetch("1?b=A")).toEqual({b: "A"});
    });
    it("should skip query if not set", async () => {
      expect(await fetch("1")).toEqual({});
    });
    it("should extract query as boolean", async () => {
      expect(await fetch("1?b=true")).toEqual({b: "true"});
      expect(await fetch("2")).toEqual({b: false});
      expect(await fetch("2?b")).toEqual({b: true});
      expect(await fetch("2?b=true")).toEqual({b: true});
      expect(await fetch("2?b=false")).toEqual({b: false});
    });
    it("should extract query as number", async () => {
      expect(await fetch("1?b=1")).toEqual({b: "1"});
      expect(await fetch("3")).toEqual({b: null});
      expect(await fetch("3?b")).toEqual({b: null});
      expect(await fetch("3?b=1")).toEqual({b: 1});
      expect(await fetch("3?b=toto")).toEqual({b: null});
    });
    it("should extract query as object", async () => {
      expect((await fetch("4", {params: {b: "h"}})).message)
        .toBe(olyApiErrors.invalidFormat("queryParam", "b", "json"));
      expect(await fetch("4", {params: {b: {h: 3}}})).toEqual({b: {h: 3}});
    });
    it("should extract query as object", async () => {
      expect((await fetch("5", {params: {b: "h"}})).message)
        .toBe(olyApiErrors.validationHasFailed());
      expect(await fetch("5", {params: {b: {name: "toto"}}})).toEqual({b: {name: "toto"}});
    });
  });
});