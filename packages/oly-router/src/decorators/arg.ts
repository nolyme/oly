import { RouterMetadataUtil } from "../utils/RouterMetadataUtil";

/**
 * Example of arg decorator.
 */
export const arg = (options: any) => {
  return (target: object, propertyKey: string, parameterIndex: number) => {

    const router = RouterMetadataUtil.getRouter(target.constructor);

    RouterMetadataUtil.setRoute(router, propertyKey, {args: {[parameterIndex]: options}});
    RouterMetadataUtil.setRouter(target.constructor, router);
  };
};
