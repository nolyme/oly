import { Logger } from "oly-core";
import { IKoaContext, IKoaMiddleware } from "oly-http";
import { JwtAuthService } from "../services/JwtAuthService";

/**
 *
 */
export const parseToken = (): IKoaMiddleware => {
  return async function parseTokenMiddleware(ctx: IKoaContext, next: Function) {

    const authorization = ctx.request.header.authorization;
    const tokenName = ctx.kernel.env("OLY_PIXIE_COOKIE");
    const logger = ctx.kernel.inject(Logger).as("parseToken");

    if (typeof authorization === "string") {

      logger.trace("bearer token detected");

      const token = authorization.replace("Bearer ", "");

      ctx.kernel.inject(JwtAuthService).checkToken(token);
    } else if (!!tokenName && !!ctx.cookies.get(tokenName)) {

      logger.trace("cookie token detected");

      ctx.kernel.inject(JwtAuthService).checkToken(ctx.cookies.get(tokenName));
    }

    await next();
  };
};
