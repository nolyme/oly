import { _, IAnyFunction, IClass, MetadataUtil } from "oly-core";
import { lyRouter } from "../constants";
import { IRoute, IRouterOptions } from "../interfaces";

/**
 * Metadata util for Koa Router.
 */
export class RouterMetadataUtil {

  /**
   * Get metadata.
   *
   * @param target    Class
   */
  public static getRouter(target: IClass | IAnyFunction): IRouterOptions {
    const router: IRouterOptions = MetadataUtil.get(lyRouter, target);
    router.routes = router.routes || {};
    return router;
  }

  /**
   * Set metadata.
   *
   * @param target    Class
   * @param router    Router metadata
   */
  public static setRouter(target: IClass | IAnyFunction, router: IRouterOptions) {
    MetadataUtil.set(lyRouter, router, target);
  }

  /**
   * Set route in Router metadata.
   * Auto create everything.
   *
   * @param router          Router metadata
   * @param propertyKey     Attribute name
   * @param route           Route metadata
   */
  public static setRoute(router: IRouterOptions, propertyKey: string, route: Partial<IRoute>): IRoute {
    router.routes[propertyKey] = router.routes[propertyKey] || {};
    router.routes[propertyKey] = _.assign({}, {
      method: "GET",
      path: "/",
    }, router.routes[propertyKey], route, {
      args: _.assign({}, router.routes[propertyKey].args || {}, route.args || {}),
    });
    router.routes[propertyKey].middlewares = router.routes[propertyKey].middlewares || [];
    return router.routes[propertyKey];
  }
}
