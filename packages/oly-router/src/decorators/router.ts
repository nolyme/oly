import { IClass, injectable } from "oly-core";
import { RouterMetadataUtil } from "../utils/RouterMetadataUtil";

/**
 * Example of router decorator.
 *
 * ```typescript
 *  @router("/")
 * class A {}
 * ```
 *
 * @decorator         Class
 * @param prefix      Define a prefix before each route of the router
 */
export const router = (prefix?: string): ClassDecorator => {
  return (target: IClass): IClass => {

    if (!!prefix) {
      const routerMetadata = RouterMetadataUtil.getRouter(target);
      routerMetadata.prefix = prefix;
      RouterMetadataUtil.setRouter(target, routerMetadata);
    }

    return injectable()(target);
  };
};
