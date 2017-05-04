import { IClass, Logger } from "oly-core";
import { HttpError, IKoaContext } from "oly-http";
import { IRoute } from "../interfaces";
import { KoaRouterBuilder } from "../services/KoaRouterBuilder";

/**
 * Instantiate a class with the kernel context.
 * Run a specific action and handle response properly.
 *
 * This middleware should be the last middleware on the stack.
 *
 * Like #root(), you will need `attachKernel()`.
 *
 * @param Type          Definition of the controller
 * @param propertyKey   Name of the method to run
 * @param route         IRoute data
 * @middleware          Koa2 middleware
 */
export const end = (Type: IClass, propertyKey: string, route: IRoute) => async (ctx: IKoaContext) => {

  // inject all "light deps" of the controller
  const target = ctx.kernel.get(Type);
  const logger = ctx.kernel.get(Logger).as("KoaRouter");

  // prepare arguments of the method
  const args = ctx.kernel.get(KoaRouterBuilder).parseParamTypes(ctx, route);

  // always push current ctx as last argument
  // this is a hidden feature
  args.push(ctx);

  // instantiate controller and call method
  const action = target[propertyKey];
  if (!action) {
    throw new HttpError(500, `Undefined action "${propertyKey}". Function isn't declared`);
  }

  logger.trace(`apply ${target.constructor.name}#${propertyKey}()`);

  const response = await action.apply(target, args);
  if (response != null) {
    // if controller returns 'something' => set to the response body
    ctx.body = response;
    ctx.status = ctx.status || 200;
  } else if (ctx.status === 404 && !ctx.body) {
    logger.trace("no body detected, status -> 204");
    // v0.3, if no response -> 204
    ctx.status = 204;
  }
};
