import { IKoaContext, IKoaMiddleware } from "oly-http";
import { Auth } from "../services/Auth";

/**
 *
 */
export const parseToken = (): IKoaMiddleware => {
  return async function parseTokenMiddleware(ctx: IKoaContext, next: Function) {
    await ctx.kernel.inject(Auth).parseToken(ctx);
    await next();
  };
};
