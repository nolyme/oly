import { ForbiddenException } from "oly-api";
import { IKoaContext, IKoaMiddleware } from "oly-http";
import { Auth } from "../services/Auth";
import { isAuth } from "./isAuth";

/**
 *
 * @param roles
 */
export const hasRole = (...roles: string[]): IKoaMiddleware => {
  return async function hasRoleMiddleware(ctx: IKoaContext, next: Function) {

    await isAuth()(ctx, () => Promise.resolve());

    const auth = ctx.kernel.inject(Auth);

    for (const role of roles) {
      if (
        !Array.isArray(auth.token.roles)
        || auth.token.roles.indexOf(role) === -1) {
        throw new ForbiddenException();
      }
    }

    await next();
  };
};
