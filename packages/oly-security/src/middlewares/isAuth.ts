import { IAnyFunction } from "oly-core";
import { HttpError, IKoaContext, IKoaMiddleware } from "oly-http";
import { JwtAuthService } from "../services/JwtAuthService";
import { parseToken } from "./parseToken";

/**
 *
 */
export const isAuth = (): IKoaMiddleware => {
  return async function isAuthMiddleware(ctx: IKoaContext, next: IAnyFunction) {

    await parseToken()(ctx, () => Promise.resolve());

    const authenticationService = ctx.kernel.get(JwtAuthService);

    if (!authenticationService.token) {
      throw new HttpError(401, "Authentication is required");
    }

    await next();
  };
};
