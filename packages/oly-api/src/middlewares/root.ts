import { IAnyFunction, Logger } from "oly-core";
import { IKoaContext, KoaMiddleware } from "oly-http";
import { ApiErrorService } from "../services/ApiErrorService";

/**
 * Basic error handler and request logger.
 */
export const root = (): KoaMiddleware => {
  return async function rootMiddleware(ctx: IKoaContext, next: IAnyFunction) {

    const logger = ctx.kernel.get(Logger).as("KoaRouter");
    const errors = ctx.kernel.get(ApiErrorService);
    logger.info(`incoming request ${ctx.method} ${ctx.path}`);
    logger.debug("request data", ctx.request.toJSON());

    try {

      await next();

      if (ctx.status >= 400) {
        throw errors.serviceNotFound();
      }

      logger.info(`request ending successfully (${ctx.status})`);
      logger.debug("response data", ctx.response.toJSON());

    } catch (e) {

      // default error handler

      ctx.status = e.status || 500;
      ctx.body = {
        error: {
          details: e.details,
          message: e.message,
          status: ctx.status,
        },
      };

      if (ctx.status === 500) {
        logger.error("internal error", e);
      }

      logger.info(`request has been rejected (${ctx.status})`);
      logger.debug("response error data", ctx.response.toJSON());
    }
  };
};
