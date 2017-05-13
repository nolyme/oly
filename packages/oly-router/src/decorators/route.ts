import { IMethods } from "../interfaces";
import { RouterMetadataUtil } from "../utils/RouterMetadataUtil";

/**
 * Example of route decorator.
 *
 * ```typescript
 * class A {
 *  @route("PATCH", "/") update() {}
 * }
 * ```
 *
 * @param method      Http method
 * @param path        Relative path
 */
export const route = (method: IMethods, path: string) => {
  return (target: object, propertyKey: string): void => {

    const router = RouterMetadataUtil.getRouter(target.constructor);

    RouterMetadataUtil.setRoute(router, propertyKey, {method, path});
    RouterMetadataUtil.setRouter(target.constructor, router);
  };
};
