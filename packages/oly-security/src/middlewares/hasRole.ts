import { IAnyFunction } from "oly-core";
import { HttpError, IKoaContext, KoaMiddleware } from "oly-http";
import { JwtAuthService } from "../services/JwtAuthService";
import { isAuth } from "./isAuth";

/**
 *
 * @param roles
 */
export const hasRole = (...roles: string[]): KoaMiddleware => {
  return async function hasRoleMiddleware(ctx: IKoaContext, next: IAnyFunction) {

    await isAuth()(ctx, () => Promise.resolve());

    const authenticationService = ctx.kernel.get(JwtAuthService);

    for (const role of roles) {
      if (authenticationService.token.roles.indexOf(role) === -1) {
        throw new HttpError(403);
      }
    }

    await next();
  };
};
