import { Kernel } from "oly-core";
import { IKoaContext } from "../src";
import { HttpClientException } from "../src/exceptions/HttpClientException";
import { HttpServerException } from "../src/exceptions/HttpServerException";
import { HttpServerProvider } from "../src/providers/HttpServerProvider";
import { HttpClient } from "../src/services/HttpClient";

describe("HttpServerProvider", () => {

  class BoomException extends HttpServerException {
    message = "Boom";
    status = 409;
  }

  const message = "OK";
  const kernel = Kernel.create({
    HTTP_SERVER_PORT: 6093,
  });

  const server = kernel.inject(HttpServerProvider)
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
        throw new BoomException("MegaBoom");
      }
      ctx.body = message;
    });

  const client = kernel.inject(HttpClient)
    .with({baseURL: server.hostname});

  it("should be fetched", async () => {
    expect((await client.get("/")).data).toBe(message);
    expect((await client.post("/")).data).toBe(message);
    expect((await client.put("/")).data).toBe(message);
    try {
      await client.del("/");
      throw new Error("");
    } catch (b) {
      const e: HttpClientException = b;
      expect(e).toBeInstanceOf(HttpClientException);
      expect(e.status).toBe(409);
      expect(e.message).toBe("MegaBoom");
      expect(e.type).toBe("BoomException");
    }
  });
});
