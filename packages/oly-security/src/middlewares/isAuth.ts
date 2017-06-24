import { UnauthorizedException } from "oly-api";
import { IKoaContext, IKoaMiddleware } from "oly-http";
import { JwtAuth } from "../services/JwtAuth";
import { parseToken } from "./parseToken";

/**
 *
 */
export const isAuth = (): IKoaMiddleware => {
  return async function isAuthMiddleware(ctx: IKoaContext, next: Function) {

    await parseToken()(ctx, () => Promise.resolve());

    const authenticationService = ctx.kernel.inject(JwtAuth);

    if (!authenticationService.token) {
      throw new UnauthorizedException();
    }

    await next();
  };
};
