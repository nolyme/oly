import { inject, Kernel, Logger } from "oly";
import { IKoaContext } from "oly-http";
import { IToken } from "../interfaces";

export class Auth {

  public token: IToken;

  @inject
  protected logger: Logger;

  @inject
  protected kernel: Kernel;

  /**
   * Find token.
   */
  public async parseToken(ctx: IKoaContext) {

    const authorization = ctx.request.header.authorization;
    if (typeof authorization === "string") {

      this.logger.trace("bearer token detected");

      const token = authorization.replace("Bearer ", "");

      await this.checkToken(token);

      return;
    }

    const cookieName = this.kernel.env("PIXIE_SESSION_IDENTIFIER");
    if (!!cookieName && !!ctx.cookies.get(cookieName)) {

      this.logger.trace("cookie token detected");

      await this.checkToken(ctx.cookies.get(cookieName));
    }
  }

  /**
   *
   * @param data
   * @param options
   */
  public createToken(data: IToken, options?: any): Promise<string> {
    throw new Error("Auth has no implementation");
  }

  /**
   *
   * @param token
   * @param options
   */
  public checkToken(token: string, options?: any): Promise<void> {
    throw new Error("Auth has no implementation");
  }
}
