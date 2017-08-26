import { Kernel } from "oly";
import { HttpClient } from "oly-http";
import { body } from "../src/core/decorators/body";
import { post } from "../src/core/decorators/post";
import { ApiProvider } from "../src/core/providers/ApiProvider";

describe("BodyTest", () => {

  class A {
    @post("/string") xstring(@body data: string) {
      return {data};
    }

    @post("/number") xnumber(@body data: number) {
      return {data};
    }

    @post("/boolean") xboolean(@body data: boolean) {
      return {data};
    }
  }

  const kernel = Kernel.create({HTTP_SERVER_PORT: 19221}).with(A);
  const server = kernel.inject(ApiProvider);
  const client = kernel.inject(HttpClient).with({baseURL: server.hostname});
  const extract = ({data}: any) => data;

  it("should parse string", async () => {
    expect(await client.post("/string", {a: "b"}).then(extract)).toBe("{\"a\":\"b\"}");
    expect(await client.post("/string", "toto").then(extract)).toBe("toto");
  });

  it("should parse as number", async () => {
    expect(await client.post("/number", "1").then(extract)).toBe(1);
  });

  it("should parse as boolean", async () => {
    expect(await client.post("/boolean", "true").then(extract)).toBe(true);
  });
});
