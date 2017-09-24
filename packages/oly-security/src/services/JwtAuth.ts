import * as jwt from "jsonwebtoken";
import { SignOptions, VerifyOptions } from "jsonwebtoken";
import { env, Global, inject, injectable } from "oly";
import { olySecurityErrors } from "../constants/errors";
import { JsonWebTokenException } from "../exceptions/JsonWebTokenException";
import { TokenExpiredException } from "../exceptions/TokenExpiredException";
import { IToken } from "../interfaces";
import { Auth } from "./Auth";
import { Crypto } from "./Crypto";

/**
 * Authentication with JSON Web Token
 */
@injectable({
  provide: Auth,
})
export class JwtAuth extends Auth {

  /**
   * Token life time in **second**.
   */
  @env("SECURITY_TOKEN_EXPIRATION")
  public readonly tokenExpiration: number = 60 * 60 * 3;

  public token: IToken;

  @inject
  protected crypto: Crypto;

  /**
   * Create a JWT with the given payload data.
   *
   * ```ts
   * const jwt = k.get(JwtAuth);
   * const tk = await jwt.createToken({id: "1", roles: []});
   * ```
   *
   * @param data        IToken
   * @param options     Jwt.sign options
   */
  public createToken(data: IToken, options: SignOptions = {}): Promise<string> {

    this.logger.trace("create token", {data});

    const config: any = {};

    if (typeof this.tokenExpiration === "number") {
      config.expiresIn = this.tokenExpiration;
    }

    return Promise.resolve(jwt.sign({data}, this.crypto.secret, Global.merge(config, options)));
  }

  /**
   * ```ts
   * const jwt = k.get(JwtAuth);
   * const tk = await jwt.createToken({id: "1", roles: []});
   *
   * await jwt.checkToken(tk);
   * ```
   *
   * ### Exceptions
   *
   * - TokenExpiredException: token is expired
   * - JsonWebTokenException: invalid token, ...
   *
   * @param token       String jwt
   * @param options     Jwt.verify options
   */
  public async checkToken(token: string, options: VerifyOptions = {}): Promise<void> {

    this.logger.trace("check token", {token});

    if (!token || typeof token !== "string") {
      throw new JsonWebTokenException("Invalid token");
    }

    token = token.replace("Bearer ", "");

    try {
      const payload = jwt.verify(token, this.crypto.secret, options) as any;
      this.token = payload.data as IToken;
    } catch (e) {
      if (e.name === "TokenExpiredError") {
        throw new TokenExpiredException();
      } else if (e.name === "JsonWebTokenError") {
        throw new JsonWebTokenException(e, olySecurityErrors.invalidToken(e.message));
      } else {
        throw e;
      }
    }
  }
}
