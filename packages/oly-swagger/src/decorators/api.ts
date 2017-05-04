import { RouterMetadataUtil } from "oly-api";
import { IRouteApi } from "../interfaces";

/**
 * @experimental
 */
export const api = (options: IRouteApi): PropertyDecorator => {
  return (target: object, propertyKey: string): void => {

    const router = RouterMetadataUtil.getRouter(target.constructor);

    RouterMetadataUtil.setRoute(router, propertyKey, {api: options});
    RouterMetadataUtil.setRouter(target.constructor, router);
  };
};
