import { ForbiddenException } from "oly-api";
import { IKoaContext, IKoaMiddleware } from "oly-http";
import { JwtAuthService } from "../services/JwtAuthService";
import { isAuth } from "./isAuth";

/**
 *
 * @param roles
 */
export const hasRole = (...roles: string[]): IKoaMiddleware => {
  return async function hasRoleMiddleware(ctx: IKoaContext, next: Function) {

    await isAuth()(ctx, () => Promise.resolve());

    const authenticationService = ctx.kernel.inject(JwtAuthService);

    for (const role of roles) {
      if (
        !Array.isArray(authenticationService.token.roles)
        || authenticationService.token.roles.indexOf(role) === -1) {
        throw new ForbiddenException();
      }
    }

    await next();
  };
};
