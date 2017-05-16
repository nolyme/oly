import { IKoaMiddleware } from "oly-http";
import { RouterMetadataUtil } from "oly-router";

/**
 * It's like Koa#use() but with decorators.
 * This is action scoped only for now.
 *
 * TODO: same for ClassDecorator
 *
 * ```typescript
 * class A {
 *  @get("/")
 *  @use(mySuperKoaMiddleware)
 *  action() {}
 * }
 * ```
 *
 * @param middleware    Koa2 middleware, not express!!
 */
export const use = (middleware: IKoaMiddleware): PropertyDecorator => {
  return (target: object, propertyKey: string): void => {

    const router = RouterMetadataUtil.getRouter(target.constructor);
    const route = RouterMetadataUtil.setRoute(router, propertyKey, {});

    route.middlewares.push(middleware);

    RouterMetadataUtil.setRouter(target.constructor, router);
  };
};
