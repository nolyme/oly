import * as jwt from "jsonwebtoken";
import { SignOptions, VerifyOptions } from "jsonwebtoken";
import { env, inject, Logger } from "oly-core";
import { UnauthorizedException } from "../../core/exceptions/UnauthorizedException";
import { olySecurityErrors } from "../constants/errors";
import { JsonWebTokenException } from "../exceptions/JsonWebTokenException";
import { TokenExpiredException } from "../exceptions/TokenExpiredException";
import { IPayload, IToken } from "../interfaces";
import { CryptoService } from "./CryptoService";

/**
 * Use JWT.
 */
export class JwtAuthService {

  @env("OLY_SECURITY_TOKEN_EXPIRATION")
  public readonly tokenExpiration: number = 60 * 60 * 3;

  public token: IToken;

  @inject
  protected logger: Logger;

  @inject
  protected cryptoService: CryptoService;

  /**
   *
   * @param id
   * @param roles
   * @param options
   */
  public createToken(id: string | number, roles: string[] = [], options: SignOptions = {}): string {

    this.logger.trace("create token", {id, roles});

    const config: any = {};

    if (typeof this.tokenExpiration === "number") {
      config.expiresIn = this.tokenExpiration;
    }

    return jwt.sign({
        data: {
          id: typeof id === "string" ? id : id.toString(),
          roles,
        },
      },
      this.cryptoService.secret,
      Object.assign({}, config, options));
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
      const payload = jwt.verify(token, this.cryptoService.secret, options);
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
