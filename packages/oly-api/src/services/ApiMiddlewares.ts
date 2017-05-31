import { _, Exception, IAnyFunction, IClass, Logger } from "oly-core";
import { HttpServerException, IKoaContext, IKoaMiddleware } from "oly-http";
import { IRouteMetadata } from "oly-router";
import { olyApiErrors } from "../constants/errors";
import { NotFoundException } from "../exceptions/NotFoundException";
import { KoaRouterBuilder } from "./KoaRouterBuilder";

/**
 * Collection of internal middlewares.
 * There are not designed to be used outside oly-api,
 * however, you can replace one of them by your own stuff.
 *
 * ```typescript
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
    return (ctx: IKoaContext, next: IAnyFunction) => {
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
    return (ctx: IKoaContext, next: IAnyFunction) => {

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
   * @param route         Optional IRouteMetadata used for params injection
   */
  public invoke(definition: IClass, propertyKey: string, route?: IRouteMetadata): IKoaMiddleware {
    return (ctx: IKoaContext) => {

      // inject all "light deps" of the controller
      const target = ctx.kernel.get(definition);
      const logger = ctx.kernel.get(Logger).as("KoaRouter");
      const args = [];

      if (route) {
        const builder = ctx.kernel.get(KoaRouterBuilder);
        args.push(...builder.parseParamTypes(ctx, route));
      }

      // always push current ctx as last argument
      // i don't know if it's a good idea
      args.push(ctx);

      // instantiate controller and call method
      const action = target[propertyKey];
      if (!action) {
        throw new Exception(olyApiErrors.undefinedAction(propertyKey));
      }

      logger.trace(`apply ${_.identity(definition, propertyKey)}()`); // tslint:disable-line

      return _.promise(action.apply(target, args)).then((response) => {
        if (response != null) {
          // if controller returns 'something' => set to the response body
          ctx.body = response;
          ctx.status = ctx.status || 200;
        } else if (ctx.status === 404 && !ctx.body) {
          logger.trace("no body detected, status -> 204");
          // (v0.3) if no response -> 204
          ctx.status = 204;
        }
      });
    };
  }
}
