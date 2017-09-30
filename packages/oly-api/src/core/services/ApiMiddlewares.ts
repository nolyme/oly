import { Class, env, Global } from "oly";
import { HttpServerException, IKoaContext, IKoaMiddleware } from "oly-http";
import { olyApiErrors } from "../constants/errors";
import { NotFoundException } from "../exceptions/NotFoundException";

/**
 * Collection of internal middlewares.<br/>
 *
 * ```ts
 * class MyApiMiddlewares extends ApiMiddlewares {
 *
 *   // override errorHandler
 *   errorHandler() {
 *     return async(ctx, next) => {
 *       await next();
 *     }
 *   }
 *
 *   // also accepted
 *   log = () => yourLoggerMiddleware;
 * }
 *
 * Kernel
 *   .create()
 *   .with({provide: ApiMiddlewares, use: MyApiMiddlewares});
 * ```
 */
export class ApiMiddlewares {

  /**
   * Hide cause of HttpServerException.
   */
  @env("API_ERROR_HIDE_CAUSE")
  public readonly hideCause: boolean = Global.isProduction();

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

        const exception = (e instanceof HttpServerException
          || (typeof e === "object"
            && typeof e.message === "string"
            && typeof e.name === "string"
            && typeof e.status === "number"
            && e.status > -1
          ))
          ? e
          : new HttpServerException(e);

        if (this.hideCause) {
          delete exception.cause;
        }

        ctx.status = exception.status;
        ctx.body = exception;
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
