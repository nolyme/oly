import { Class, Logger } from "oly-core";
import { HttpServerException, IKoaContext, IKoaMiddleware } from "oly-http";
import { olyApiErrors } from "../constants/errors";
import { NotFoundException } from "../exceptions/NotFoundException";

/**
 * Collection of internal middlewares.
 * There are not designed to be used outside oly-api,
 * however, you can replace one of them by your own stuff.
 *
 * ```ts
 * class MyApiMiddlewares extends ApiMiddlewares {
 *   errorHandler() {
 *     return async(ctx, next) => {
 *       await next();
 *     }
 *   }
 *   // or even better
 *   log = () => yourLoggerMiddleware;
 * }
 * // and in the root file:
 * new Kernel()
 *   .with({provide: ApiMiddlewares, use: MyApiMiddlewares});
 * ```
 */
export class ApiMiddlewares {

  /**
   * Basic error handler.
   */
  public errorHandler(): IKoaMiddleware {
    return (ctx: IKoaContext, next: Function) => {
      return next().then(() => {

        // override koa 404 by our 404 Exception
        if (ctx.status === 404) {
          throw new NotFoundException(olyApiErrors.serviceNotFound());
        }

      }).catch((e: any) => {

        const exception = (e instanceof HttpServerException || typeof e === "object" && e.message && e.status && e.name)
          ? e
          : new HttpServerException(e);

        ctx.status = exception.status;
        ctx.body = exception;
      });
    };
  }

  /**
   * Simple request logger.
   */
  public log(): IKoaMiddleware {
    return (ctx: IKoaContext, next: Function) => {

      const logger = ctx.kernel.get(Logger).as("KoaRouter");

      logger.info(`incoming request ${ctx.method} ${ctx.path}`);
      logger.debug("request data", ctx.request.toJSON());

      return next().then(() => {
        if (ctx.status < 400) {

          logger.info(`request ending successfully (${ctx.status})`);
          logger.debug("response data", ctx.response.toJSON());

        } else {

          if (ctx.status === 500) {
            logger.error("internal error", ctx.body);
          }

          logger.info(`request has been rejected (${ctx.status})`);
          logger.debug("response error data", ctx.response.toJSON());
        }
      });
    };
  }

  /**
   * Instantiate a class with the kernel context.
   * Run a specific action and handle response properly.
   *
   * This middleware should be the last middleware on the stack.
   *
   * @param definition    Definition of the controller
   * @param propertyKey   Name of the method to run
   */
  public invoke(definition: Class, propertyKey: string): IKoaMiddleware {
    return (ctx: IKoaContext) => {

      ctx.kernel.state("Koa.context", ctx);

      return new Promise((eat) => eat(ctx.kernel.invoke(definition, propertyKey, [ctx]))).then((response) => {
        if (response != null) {
          // if controller returns 'something' => set to the response body
          ctx.body = response;
          ctx.status = ctx.status || 200;
        } else if (ctx.status === 404 && !ctx.body) {
          // (v0.3) if no response -> 204
          ctx.status = 204;
        }
      });
    };
  }
}
