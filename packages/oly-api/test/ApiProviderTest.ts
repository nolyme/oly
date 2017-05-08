import { equal } from "assert";
import { Kernel } from "oly-core";
import { HttpClient } from "oly-http";
import { field } from "oly-mapper";
import { ApiProvider } from "../src";
import { body } from "../src/decorators/body";
import { del } from "../src/decorators/del";
import { get } from "../src/decorators/get";
import { path } from "../src/decorators/path";
import { post } from "../src/decorators/post";
import { router } from "../src/decorators/router";
import { IApiError } from "../src/interfaces";

describe("ApiProvider", () => {
  describe("@get()", () => {

    @router("/hello")
    class MyController {

      @get("/") index = () => "Hello World";

      @get("/:name")
      byName(@path("name") name: string) {
        return `Hello ${name}`;
      }
    }

    const kernel = new Kernel({OLY_LOGGER_LEVEL: "ERROR", OLY_HTTP_SERVER_PORT: 2931}).with(MyController);
    const server = kernel.get(ApiProvider);
    const client = kernel.get(HttpClient).with({
      baseURL: server.hostname,
      validateStatus: () => true,
    });

    beforeAll(async () => {
      await kernel.start();
    });
    afterAll(async () => {
      await kernel.stop();
    });

    it("should response correctly", async () => {
      equal((await client.request<IApiError>({url: "/"})).data.error.message,
        "The requested service does not exists");
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

    const kernel = new Kernel({OLY_LOGGER_LEVEL: "ERROR", OLY_HTTP_SERVER_PORT: 2911}).with(MyController);
    const server = kernel.get(ApiProvider);
    const client = kernel.get(HttpClient).with({
      baseURL: server.hostname,
      validateStatus: () => true,
    });

    beforeAll(async () => {
      await kernel.start();
    });

    afterAll(async () => {
      await kernel.stop();
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
});
