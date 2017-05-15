import { attachKernel } from "oly-test";
import { IKoaContext } from "../src";
import { HttpServerProvider } from "../src/providers/HttpServerProvider";
import { HttpClient } from "../src/services/HttpClient";

describe("HttpServerProvider", () => {

  const message = "OK";
  const fakeMiddleware = (ctx: IKoaContext) => {
    if (ctx.method === "DELETE") {
      ctx.status = 500;
      ctx.body = "Boom";
      return;
    }
    ctx.body = message;
  };
  const kernel = attachKernel({
    OLY_HTTP_SERVER_PORT: 6093,
  });
  const server = kernel.get(HttpServerProvider).use(fakeMiddleware);
  const client = kernel.get(HttpClient).with({baseURL: server.hostname});

  it("should be fetched", async () => {
    expect((await client.get("/")).data).toBe(message);
    expect((await client.post("/")).data).toBe(message);
    expect((await client.put("/")).data).toBe(message);
    try {
      await client.del("/");
      throw new Error("");
    } catch (e) {
      expect(e.status).toBe(500);
      expect(e.message).toBe("Boom");
    }
  });
});
