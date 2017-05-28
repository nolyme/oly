import { attachKernel } from "oly-test";
import { IKoaContext } from "../src";
import { HttpClientException } from "../src/exceptions/HttpClientException";
import { HttpServerException } from "../src/exceptions/HttpServerException";
import { HttpServerProvider } from "../src/providers/HttpServerProvider";
import { HttpClient } from "../src/services/HttpClient";

describe("HttpServerProvider", () => {

  const message = "OK";

  const fakeMiddleware = (ctx: IKoaContext) => {
    if (ctx.method === "DELETE") {
      throw new HttpServerException("Boom");
    }
    ctx.body = message;
  };

  const kernel = attachKernel({
    OLY_HTTP_SERVER_PORT: 6093,
  });

  const server = kernel.get(HttpServerProvider)
    .use((ctx, next) => {
      return next().catch((e) => {
        if (e instanceof HttpServerException) {
          ctx.status = e.status;
          ctx.body = e.toJSON();
        }
      });
    })
    .use((ctx: IKoaContext) => {
      if (ctx.method === "DELETE") {
        throw new HttpServerException("Boom");
      }
      ctx.body = message;
    });

  const client = kernel.get(HttpClient)
    .with({baseURL: server.hostname});

  it("should be fetched", async () => {
    expect((await client.get("/")).data).toBe(message);
    expect((await client.post("/")).data).toBe(message);
    expect((await client.put("/")).data).toBe(message);
    try {
      await client.del("/");
      throw new Error("");
    } catch (e) {
      expect(e).toBeInstanceOf(HttpClientException);
      expect(e.status).toBe(500);
      expect(e.message).toBe("Boom");
    }
  });
});
