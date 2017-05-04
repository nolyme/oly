import { CommonUtil, IClass, injectable } from "oly-core";
import { IRouterOptions } from "../interfaces";
import { RouterMetadataUtil } from "../utils/KoaRouterUtil";

/**
 * Controller/Router options.
 *
 * ```typescript
 *  @router({prefix: '/'})
 * class A {}
 * ```
 *
 * @param options     Define a prefix
 */
export const router =
  (options?: IRouterOptions | string): ClassDecorator =>
    (target: IClass): IClass => {

      const props = typeof options === "string"
        ? {prefix: options}
        : options;

      const routerMetadata = RouterMetadataUtil.getRouter(target);

      if (!!props) {
        RouterMetadataUtil.setRouter(target, CommonUtil.assign({}, routerMetadata, props));
      }

      return injectable()(target);
    };
