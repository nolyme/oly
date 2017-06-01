import { UnauthorizedException } from "oly-api";
import { Function } from "oly-core";
import { IKoaContext, IKoaMiddleware } from "oly-http";
import { JwtAuthService } from "../services/JwtAuthService";
import { parseToken } from "./parseToken";

/**
 *
 */
export const isAuth = (): IKoaMiddleware => {
  return async function isAuthMiddleware(ctx: IKoaContext, next: Function) {

    await parseToken()(ctx, () => Promise.resolve());

    const authenticationService = ctx.kernel.get(JwtAuthService);

    if (!authenticationService.token) {
      throw new UnauthorizedException();
    }

    await next();
  };
};
