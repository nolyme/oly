import { ApiProvider, ForbiddenException, get, UnauthorizedException } from "oly-api";
import { HttpClient, HttpClientException } from "oly-http";
import { attachKernel } from "oly-test";
import { auth } from "../src";
import { olySecurityErrors } from "../src/constants/errors";
import { JwtAuthService } from "../src/services/JwtAuthService";
import { JwtUtil } from "../src/utils/JwtUtil";

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

  beforeEach(() => {
    kernel.state("OLY_SECURITY_TOKEN_EXPIRATION", 60 * 60 * 3);
  });

  it("should reject unauthorized requests", async () => {
    try {
      await client.get("/");
      throw new Error("");
    } catch (e) {
      expect(e).toBeInstanceOf(HttpClientException);
      expect(e.status).toBe(401);
      expect(e.message).toBe(UnauthorizedException.defaultMessage);
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
      expect(e.message).toBe(ForbiddenException.defaultMessage);
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
    kernel.state("OLY_SECURITY_TOKEN_EXPIRATION", 0);
    const token = jwt.createToken("<id>");
    expect(JwtUtil.isValid(token)).toBeFalsy();
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
