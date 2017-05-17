import * as jwt from "jsonwebtoken";
import { SignOptions, VerifyOptions } from "jsonwebtoken";
import { UnauthorizedException } from "oly-api";
import { CommonUtil as _, env, inject, Logger } from "oly-core";
import { IPayload, IToken } from "../interfaces";
import { CryptoService } from "./CryptoService";

/**
 * Use JWT.
 */
export class JwtAuthService {

  @env("OLY_SECURITY_TOKEN_EXPIRATION")
  public readonly tokenExpiration: number | string = 60 * 60 * 3;

  public token: IToken;

  @inject(Logger)
  protected logger: Logger;

  @inject(CryptoService)
  protected cryptoService: CryptoService;

  /**
   *
   * @param id
   * @param roles
   * @param options
   * @return {string}
   */
  public createToken(id: string | number, roles: string[] = [], options: SignOptions = {}): string {

    this.logger.trace("create token", {id, roles});

    const config: any = {};
    const expiresIn = Number(this.tokenExpiration);

    if (expiresIn && !isNaN(expiresIn)) {
      config.expiresIn = expiresIn;
    }

    return jwt.sign({
        data: {
          id: typeof id === "string" ? id : id.toString(),
          roles,
        },
      },
      this.cryptoService.secret,
      _.assign({}, config, options));
  }

  /**
   *
   * @param token
   * @param options
   * @return {any}
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
      throw new UnauthorizedException(e, "Invalid token");
    }
  }
}
