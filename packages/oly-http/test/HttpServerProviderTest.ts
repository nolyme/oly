import { equal } from "assert";
import { Kernel } from "oly-core";
import { IKoaContext } from "../src";
import { HttpServerProvider } from "../src/providers/HttpServerProvider";
import { HttpClient } from "../src/services/HttpClient";

describe("HttpServerProvider", () => {

  const message = "OK";
  const kernel = new Kernel({
    OLY_HTTP_SERVER_PORT: 6093,
    OLY_LOGGER_LEVEL: "ERROR",
  }).configure((k: Kernel) =>
    k.get(HttpServerProvider).use((ctx: IKoaContext) => {
      if (ctx.method === "DELETE") {
        ctx.status = 500;
        ctx.body = "Boom";
        return;
      }
      ctx.body = message;
    }));
  const server = kernel.get(HttpServerProvider);
  const client = kernel.get(HttpClient).with({baseURL: server.hostname});

  beforeAll(() => kernel.start());
  afterAll(() => kernel.stop());

  it("should be fetched", async () => {
    equal((await client.get("/")).data, message);
    equal((await client.post("/")).data, message);
    equal((await client.put("/")).data, message);
    try {
      await client.del("/");
      throw new Error("");
    } catch (e) {
      expect(e.status).toBe(500);
      expect(e.message).toBe("Boom");
    }
  });
});
