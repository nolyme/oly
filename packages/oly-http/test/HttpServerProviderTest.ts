import {Kernel} from "oly";
import { IKoaContext } from "../src";
import { olyHttpErrors } from "../src/constants/errors";
import { HttpClientException } from "../src/exceptions/HttpClientException";
import { HttpServerException } from "../src/exceptions/HttpServerException";
import { HttpServerProvider } from "../src/providers/HttpServerProvider";
import { HttpClient } from "../src/services/HttpClient";

describe("HttpServerProvider", () => {

  class BoomException extends HttpServerException {
    constructor(message = "Boom") {
      super(message);
    }
    status = 409;
  }

  const kernel = Kernel.create({
    HTTP_SERVER_PORT: 6093,
  });

  const server = kernel
    .inject(HttpServerProvider)
    .use((ctx, next) => {
      return next().catch((e) => {
        // imitate default error handler ;)
        if (e instanceof HttpServerException) {
          ctx.status = e.status;
          ctx.body = e.toJSON();
        }
      });
    })
    .use((ctx: IKoaContext) => {
      // imitate a random web service
      if (ctx.method === "DELETE") {
        throw new BoomException("MegaBoom").because(new Error("Outch!"));
      }
      ctx.body = "OK";
    });

  const client = kernel
    .inject(HttpClient)
    .with({baseURL: server.hostname});

  it("should be fetched", async () => {
    expect((await client.get("/"))).toBe("OK");
    expect((await client.post("/"))).toBe("OK");
    expect((await client.put("/"))).toBe("OK");
    try {
      await client.del("/");
      throw new Error("");
    } catch (b) {
      const e: HttpClientException<HttpServerException> = b;
      expect(e).toBeInstanceOf(HttpClientException);
      expect(e.isHttpServerException()).toBe(true);
      expect(e.isHttpServerException("BoomException")).toBe(true);
      expect(e.status).toBe(409);
      expect(e.message).toBe(olyHttpErrors.requestHasFailedWithMessage(
        e.cause.config.method,
        e.cause.config.url,
        409,
        "MegaBoom"));
      expect(e.body.name).toBe("BoomException");
      expect(e.body.message).toBe("MegaBoom");
      expect(e.body.cause!.name).toBe("Error");
      expect(e.body.cause!.message).toBe("Outch!");
    }
  });
});
