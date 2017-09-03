import { Logger } from "oly";
import { IKoaContext, IKoaMiddleware } from "oly-http";
import { JwtAuth } from "../services/JwtAuth";

/**
 *
 */
export const parseToken = (): IKoaMiddleware => {
  return async function parseTokenMiddleware(ctx: IKoaContext, next: Function) {

    const authorization = ctx.request.header.authorization;
    const cookieName = ctx.kernel.env("PIXIE_SESSION_NAME");
    const logger = ctx.kernel.inject(Logger).as("parseToken");

    if (typeof authorization === "string") {

      logger.trace("bearer token detected");

      const token = authorization.replace("Bearer ", "");

      ctx.kernel.inject(JwtAuth).checkToken(token);
    } else if (!!cookieName && !!ctx.cookies.get(cookieName)) {

      logger.trace("cookie token detected");

      ctx.kernel.inject(JwtAuth).checkToken(ctx.cookies.get(cookieName));
    }

    await next();
  };
};
