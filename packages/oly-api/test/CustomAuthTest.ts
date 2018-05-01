import { inject, Kernel, state } from "oly";
import { ApiProvider, body, ForbiddenException, get, post, UnauthorizedException } from "../src";
import { HttpClient, IKoaContext } from "oly-http";
import { IToken } from "../src";
import { auth } from "../src/security/decorators/auth";
import { token } from "../src/security/decorators/token";
import { Auth } from "../src/security/services/Auth";

describe("CustomAuth", () => {

  class MyAuth extends Auth {
    @state sessions: IToken[] = [];

    async parseToken(ctx: IKoaContext) {
      if (typeof ctx.request.headers.buuuu === "string") {
        return this.checkToken(ctx.request.headers.buuuu.replace("Bearer ", ""));
      }
    }

    async createToken(data: IToken) {
      this.sessions.push(data);
      return `token${this.sessions.length - 1}`;
    }

    async checkToken(id: string) {
      this.token = this.sessions[Number(id.replace("token", ""))];
    }
  }

  class Api {
    @inject auth: Auth;

    @post("/token")
    token(@body payload: IToken) {
      return this.auth.createToken(payload);
    }

    @get("/auth")
    authOnly(@token() tk: IToken) {
      return {ok: true, token: tk};
    }

    @auth("ADMIN")
    @get("/admin")
    adminOnly() {
      return {ok: true, token: this.auth.token};
    }
  }

  const k = Kernel
    .create({
      HTTP_SERVER_PORT: 6068,
    })
    .with({provide: Auth, use: MyAuth})
    .with(Api, ApiProvider);

  const server = k.get(ApiProvider);
  const client = k.get(HttpClient).with({
    validateStatus: () => true,
    baseURL: server.hostname,
  });

  const error = (ex: any) => JSON.parse(JSON.stringify(new ex()));
  const authorize = (value: string) => ({headers: {buuuu: `Bearer ${value}`}});

  it("should reject unauth", async () => {
    expect(await client.get("/auth")).toEqual(error(UnauthorizedException));
  });

  it("should accept auth", async () => {
    const id = Math.random();
    const tk = await client.post("/token", {id});

    expect(await client.get("/auth", authorize(tk))).toEqual({ok: true, token: {id}});
    expect(await client.get("/admin", authorize(tk))).toEqual(error(ForbiddenException));
  });

  it("should accept auth/role", async () => {
    const id = Math.random();
    const tk = await client.post("/token", {id, roles: ["ADMIN"]});

    expect(await client.get("/auth", authorize(tk))).toEqual({ok: true, token: {id, roles: ["ADMIN"]}});
    expect(await client.get("/admin", authorize(tk))).toEqual({ok: true, token: {id, roles: ["ADMIN"]}});
  });
});
