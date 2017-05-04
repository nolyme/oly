import { RouterMetadataUtil } from "../utils/KoaRouterUtil";

/**
 * @private
 */
export const arg =
  (options: any) =>
    (target: object, propertyKey: string, parameterIndex: number) => {

      const router = RouterMetadataUtil.getRouter(target.constructor);

      RouterMetadataUtil.setRoute(router, propertyKey, {args: {[parameterIndex]: options}});
      RouterMetadataUtil.setRouter(target.constructor, router);
    };
