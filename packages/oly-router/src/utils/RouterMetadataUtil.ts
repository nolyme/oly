import { _, IAnyFunction, IClass, MetadataUtil } from "oly-core";
import { lyRouter } from "../constants";
import { IRouteMetadata, IRouterMetadata } from "../interfaces";

/**
 * Router Metadata util.
 */
export class RouterMetadataUtil {

  /**
   * Get metadata.
   *
   * @param target    Class
   */
  public static getRouter(target: IClass | IAnyFunction): IRouterMetadata {
    const router: IRouterMetadata = MetadataUtil.get(lyRouter, target);
    router.routes = router.routes || {};
    return router;
  }

  /**
   * Set metadata.
   *
   * @param target    Class
   * @param router    Router metadata
   */
  public static setRouter(target: IClass | IAnyFunction, router: IRouterMetadata): void {
    MetadataUtil.set(lyRouter, router, target);
  }

  /**
   * Has metadata.
   *
   * @param target    Class
   */
  public static hasRouter(target: IClass | IAnyFunction): boolean {
    return MetadataUtil.has(lyRouter, target);
  }

  /**
   * Set route in Router metadata.
   *
   * @param router          Router metadata
   * @param propertyKey     Attribute name
   * @param route           Route metadata
   */
  public static setRoute(router: IRouterMetadata, propertyKey: string, route: Partial<IRouteMetadata>): IRouteMetadata {
    router.routes[propertyKey] = router.routes[propertyKey] || {};
    router.routes[propertyKey] = _.assign({}, {
      method: "GET",
      path: "/",
    }, router.routes[propertyKey], route, {
      args: _.assign({}, router.routes[propertyKey].args || {}, route.args || {}),
    });
    router.routes[propertyKey].api = router.routes[propertyKey].api || {};
    router.routes[propertyKey].middlewares = router.routes[propertyKey].middlewares || [];
    return router.routes[propertyKey];
  }
}
