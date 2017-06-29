import * as KoaRouter from "koa-router";
import { Class, inject } from "oly-core";
import { MetaRouter } from "oly-router";
import { ApiMiddlewares } from "./ApiMiddlewares";

/**
 * koa-router build based on metadata.
 */
export class KoaRouterBuilder {

  @inject
  protected apiMiddlewares: ApiMiddlewares;

  /**
   * Transform router metadata into a fresh koa-router object.
   *
   * @param definition   Annotated class with router metadata
   */
  public createFromDefinition(definition: Class): KoaRouter {

    const routerMetadata = MetaRouter.get(definition);
    if (!routerMetadata) {
      throw new Error("There is no meta router in this class");
    }

    const prefix = (routerMetadata.target.prefix && routerMetadata.target.prefix !== "/")
      ? routerMetadata.target.prefix
      : "";
    const koaRouter = new KoaRouter({prefix});

    const keys = Object.keys(routerMetadata.properties);
    for (const propertyKey of keys) {

      const route = routerMetadata.properties[propertyKey];
      const mount = koaRouter[route.method.toLowerCase()];

      mount.apply(koaRouter, [
        route.path,
        ...route.middlewares,
        this.apiMiddlewares.invoke(definition, propertyKey),
      ]);

      // hack used for logging only (@see ApiProvider)
      (koaRouter.stack[koaRouter.stack.length - 1] as any).propertyKey = propertyKey;
    }

    return koaRouter;
  }
}
