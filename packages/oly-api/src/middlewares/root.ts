import { IAnyFunction, Logger } from "oly-core";
import { HttpError, IKoaContext, KoaMiddleware } from "oly-http";

/**
 * Basic error handler et request logger.
 *
 * Like #root(), you will need `context()`.
 *
 * @middleware    Koa2 middleware
 */
export const root = (): KoaMiddleware => async (ctx: IKoaContext, next: IAnyFunction) => {

  const logger = ctx.kernel.get(Logger).as("KoaRouter");
  logger.info(`incoming request ${ctx.method} ${ctx.path}`);
  logger.debug("request data", ctx.request.toJSON());

  try {

    await next();

    if (ctx.status >= 400) {
      throw new HttpError(ctx.status, "The requested service does not exists");
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
