import { equal } from "assert";
import { Kernel } from "oly";
import { HttpClient, HttpServerException, IHttpRequest } from "oly-http";
import { build, field } from "oly-json";
import { olyApiErrors } from "../src/core/constants/errors";
import { body } from "../src/core/decorators/body";
import { del } from "../src/core/decorators/del";
import { get } from "../src/core/decorators/get";
import { param } from "../src/core/decorators/param";
import { post } from "../src/core/decorators/post";
import { query } from "../src/core/decorators/query";
import { router } from "../src/core/decorators/router";
import { ApiProvider } from "../src/core/providers/ApiProvider";

describe("ApiProviderLegacy", () => {

  describe("@get()", () => {

    class MyAbstract {
      @get("/") index = () => "Hello World";
    }

    @router("/bug")
    class MySecondAbstract extends MyAbstract {
      @get("/:name")
      byName(@param("name") name: string) {
        return `Hello ${name}`;
      }
    }

    @router("/hello")
    class MyController extends MySecondAbstract {
    }

    const kernel = Kernel.create({HTTP_SERVER_PORT: 19220}).with(MyController);
    const server = kernel.inject(ApiProvider);
    const client = kernel.inject(HttpClient).with({
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
      @field password: string;
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
      check(@build @body data: DataCheck) {
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

    const kernel = Kernel.create({HTTP_SERVER_PORT: 2911}).with(MyController);
    const server = kernel.inject(ApiProvider);
    const client = kernel.inject(HttpClient).with({
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
      a5(@build @query("b") b: Data) {
        return {b};
      }
    }

    const kernel = Kernel.create({HTTP_SERVER_PORT: 2912}).with(A);
    const server = kernel.inject(ApiProvider);
    const client = kernel.inject(HttpClient).with({
      baseURL: server.hostname,
      validateStatus: () => true,
    });
    const fetch = async (pathname: string, o: IHttpRequest = {}) =>
      (await client.get<any>("/" + pathname, o));

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
      expect(await fetch("3")).toEqual({});
      expect(await fetch("3?b")).toEqual({});
      expect(await fetch("3?b=1")).toEqual({b: 1});
      expect(await fetch("3?b=toto")).toEqual({b: null});
    });
    it("should extract query as object", async () => {
      expect(await fetch("4", {params: {b: {h: 3}}})).toEqual({b: {h: 3}});
      expect(await fetch("4", {params: {b: {h: "2"}}})).toEqual({b: {h: "2"}});
      expect(await fetch("5", {params: {b: {name: "toto"}}})).toEqual({b: {name: "toto"}});
      expect((await fetch("5", {params: {b: {name2: "toto"}}})).message).toContain("Validation has failed");
    });
  });
});
