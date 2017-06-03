import { IKoaContext, IKoaMiddleware } from "oly-http";
import { ForbiddenException } from "../../core/exceptions/ForbiddenException";
import { JwtAuthService } from "../services/JwtAuthService";
import { isAuth } from "./isAuth";

/**
 *
 * @param roles
 */
export const hasRole = (...roles: string[]): IKoaMiddleware => {
  return async function hasRoleMiddleware(ctx: IKoaContext, next: Function) {

    await isAuth()(ctx, () => Promise.resolve());

    const authenticationService = ctx.kernel.get(JwtAuthService);

    for (const role of roles) {
      if (authenticationService.token.roles.indexOf(role) === -1) {
        throw new ForbiddenException();
      }
    }

    await next();
  };
};
