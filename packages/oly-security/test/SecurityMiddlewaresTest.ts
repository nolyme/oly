import { ApiProvider, get, olyApiErrors } from "oly-api";
import { Kernel } from "oly";
import { HttpClient, HttpClientException } from "oly-http";
import { olySecurityErrors } from "../src/constants/errors";
import { auth } from "../src/decorators/auth";
import { JwtAuth } from "../src/services/JwtAuth";
import { Jwt } from "../src/utils/Jwt";

class App {

  @auth("ADMIN")
  @get("/")
  secure() {
    return "OK";
  }
}

describe("SecurityMiddlewares", () => {

  const kernel = Kernel.create({
    HTTP_SERVER_PORT: 6049,
  }).with(App);
  const server = kernel.inject(ApiProvider);
  const jwt = kernel.inject(JwtAuth);
  const client = kernel.inject(HttpClient).with({
    baseURL: server.hostname,
  });

  beforeEach(() => {
    kernel.state("SECURITY_TOKEN_EXPIRATION", 60 * 60 * 3);
  });

  it("should reject unauthorized requests", async () => {
    try {
      await client.get("/");
      throw new Error("");
    } catch (e) {
      expect(e).toBeInstanceOf(HttpClientException);
      expect(e.status).toBe(401);
      expect(e.message).toContain(olyApiErrors.unauthorized());
    }
  });

  it("should reject invalid token", async () => {
    try {
      await client.get("/", {
        headers: {
          Authorization: `Bearer ooooo`,
        },
      });
      throw new Error("");
    } catch (e) {
      expect(e).toBeInstanceOf(HttpClientException);
      expect(e.status).toBe(401);
      expect(e.body.name).toBe("JsonWebTokenException");
      expect(e.message).toContain(olySecurityErrors.invalidToken("jwt malformed"));
    }
  });

  it("should reject forbidden requests", async () => {
    try {
      await client.get("/", {
        headers: {
          Authorization: `Bearer ${jwt.createToken({id: "<id>"})}`,
        },
      });
      throw new Error("That's not the expected error");
    } catch (e) {
      expect(e.message).toContain(olyApiErrors.forbidden());
      expect(e).toBeInstanceOf(HttpClientException);
      expect(e.status).toBe(403);
    }
  });

  it("should allow auth requests", async () => {
    const data = await client.get("/", {
      headers: {
        Authorization: `Bearer ${jwt.createToken({id: "<id>", roles: ["ADMIN"]})}`,
      },
    });
    expect(data).toBe("OK");
  });

  it("should reject expired token", async () => {
    kernel.state("SECURITY_TOKEN_EXPIRATION", 0);
    const token = jwt.createToken({id: "<id>", roles: []});
    expect(Jwt.isValid(token)).toBeFalsy();
    try {
      await client.get("/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      throw new Error("That's not the expected error");
    } catch (e) {
      expect(e.message).toContain(olySecurityErrors.tokenExpired());
      expect(e).toBeInstanceOf(HttpClientException);
      expect(e.status).toBe(401);
      expect(e.body.name).toBe("TokenExpiredException");
    }
  });
});
