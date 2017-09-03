import * as jwt from "jsonwebtoken";
import { SignOptions, VerifyOptions } from "jsonwebtoken";
import { env, Global, inject, Logger } from "oly";
import { UnauthorizedException } from "oly-api";
import { olySecurityErrors } from "../constants/errors";
import { JsonWebTokenException } from "../exceptions/JsonWebTokenException";
import { TokenExpiredException } from "../exceptions/TokenExpiredException";
import { IPayload, IToken } from "../interfaces";
import { Crypto } from "./Crypto";

/**
 * Authentication with JSON Web Token
 */
export class JwtAuth {

  @env("SECURITY_TOKEN_EXPIRATION")
  public readonly tokenExpiration: number = 60 * 60 * 3;

  public token: IToken;

  @inject
  protected logger: Logger;

  @inject
  protected crypto: Crypto;

  /**
   *
   * @param data
   * @param options
   */
  public createToken(data: IToken, options: SignOptions = {}): string {

    this.logger.trace("create token", {data});

    const config: any = {};

    if (typeof this.tokenExpiration === "number") {
      config.expiresIn = this.tokenExpiration;
    }

    return jwt.sign({data}, this.crypto.secret, Global.merge(config, options));
  }

  /**
   *
   * @param token
   * @param options
   */
  public checkToken(token: string, options: VerifyOptions = {}): IPayload {

    this.logger.trace("check token", {token});

    if (!token || typeof token !== "string") {
      throw new UnauthorizedException("Invalid token");
    }

    token = token.replace("Bearer ", "");

    try {
      const payload = jwt.verify(token, this.crypto.secret, options) as any;
      this.token = payload.data as IToken;
      return payload;
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
