import { Kernel } from "oly-core";
import { HttpClient, HttpClientException } from "oly-http";
import { olyApiErrors } from "../../src/core/constants/errors";
import { get } from "../../src/core/decorators/get";
import { ApiProvider } from "../../src/core/providers/ApiProvider";
import { olySecurityErrors } from "../../src/security/constants/errors";
import { auth } from "../../src/security/decorators/auth";
import { JwtAuthService } from "../../src/security/services/JwtAuthService";
import { Jwt } from "../../src/security/utils/Jwt";

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
  const jwt = kernel.inject(JwtAuthService);
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
      expect(e.message).toBe(olyApiErrors.unauthorized());
    }
  });

  it("should reject invalid token", async () => {
    try {
      await client.get("/", {
        headers: {
          Authorization: `Bearer HAHAHAHAHA`,
        },
      });
      throw new Error("");
    } catch (e) {
      expect(e).toBeInstanceOf(HttpClientException);
      expect(e.status).toBe(401);
      expect(e.name).toBe("JsonWebTokenException");
      expect(e.message).toBe(olySecurityErrors.invalidToken("jwt malformed"));
    }
  });

  it("should reject forbidden requests", async () => {
    try {
      await client.get("/", {
        headers: {
          Authorization: `Bearer ${jwt.createToken("<id>")}`,
        },
      });
      throw new Error("");
    } catch (e) {
      expect(e).toBeInstanceOf(HttpClientException);
      expect(e.status).toBe(403);
      expect(e.message).toBe(olyApiErrors.forbidden());
    }
  });

  it("should allow auth requests", async () => {
    const {data} = await client.get("/", {
      headers: {
        Authorization: `Bearer ${jwt.createToken("<id>", ["ADMIN"])}`,
      },
    });
    expect(data).toBe("OK");
  });

  it("should reject expired token", async () => {
    kernel.state("SECURITY_TOKEN_EXPIRATION", 0);
    const token = jwt.createToken("<id>");
    expect(Jwt.isValid(token)).toBeFalsy();
    try {
      await client.get("/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      throw new Error("");
    } catch (e) {
      expect(e).toBeInstanceOf(HttpClientException);
      expect(e.status).toBe(401);
      expect(e.name).toBe("TokenExpiredException");
      expect(e.message).toBe(olySecurityErrors.tokenExpired());
    }
  });
});
