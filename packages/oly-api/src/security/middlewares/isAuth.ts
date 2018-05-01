import { IKoaContext, IKoaMiddleware } from "oly-http";
import { UnauthorizedException } from "../..";
import { Auth } from "../services/Auth";
import { parseToken } from "./parseToken";

/**
 *
 */
export const isAuth = (): IKoaMiddleware => {
  return async function isAuthMiddleware(ctx: IKoaContext, next: Function) {

    await parseToken()(ctx, () => Promise.resolve());

    const auth = ctx.kernel.inject(Auth);

    if (!auth.token) {
      throw new UnauthorizedException();
    }

    await next();
  };
};
