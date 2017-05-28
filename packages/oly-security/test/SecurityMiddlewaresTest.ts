import { ApiProvider, ForbiddenException, get, UnauthorizedException } from "oly-api";
import { HttpClient, HttpClientException } from "oly-http";
import { attachKernel } from "oly-test";
import { auth } from "../src";
import { JwtAuthService } from "../src/services/JwtAuthService";

class App {

  @auth("ADMIN")
  @get("/")
  secure() {
    return "OK";
  }
}

describe("SecurityMiddlewares", () => {

  const kernel = attachKernel({
    OLY_HTTP_SERVER_PORT: 6049,
  }).with(App);
  const server = kernel.get(ApiProvider);
  const jwt = kernel.get(JwtAuthService);
  const client = kernel.get(HttpClient).with({
    baseURL: server.hostname,
  });

  it("should reject unauthorized requests", async () => {
    try {
      await client.get<HttpClientException>("/");
      throw new Error("");
    } catch (e) {
      expect(e).toBeInstanceOf(HttpClientException);
      expect(e.status).toBe(401);
      expect(e.message).toBe(UnauthorizedException.defaultMessage);
    }
  });

  it("should reject forbidden requests", async () => {
    try {
      await client.get<HttpClientException>("/", {
        headers: {
          Authorization: `Bearer ${jwt.createToken("<id>")}`,
        },
      });
      throw new Error("");
    } catch (e) {
      expect(e).toBeInstanceOf(HttpClientException);
      expect(e.status).toBe(403);
      expect(e.message).toBe(ForbiddenException.defaultMessage);
    }
  });

  it("should allow auth requests", async () => {
    const {data} = await client.get<HttpClientException>("/", {
      headers: {
        Authorization: `Bearer ${jwt.createToken("<id>", ["ADMIN"])}`,
      },
    });
    expect(data).toBe("OK");
  });
});
