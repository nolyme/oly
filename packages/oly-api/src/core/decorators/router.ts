import { IDecorator, Meta } from "oly";
import { olyApiKeys } from "../constants/keys";

export interface IRouterOptions {
  prefix?: string;
}

export class RouterDecorator implements IDecorator {

  private options: IRouterOptions;

  public constructor(options: IRouterOptions | string = {}) {
    if (typeof options === "string") {
      this.options = {
        prefix: options,
      };
    } else {
      this.options = options;
    }
  }

  public asClass(target: Function): void {
    Meta.of({key: olyApiKeys.router, target}).set({
      prefix: this.options.prefix || "/",
    });
  }
}

/**
 * Prefix all routes of a class.
 *
 * ```ts
 * &shy;@router("/a")
 * class Ctrl {
 *
 *   @get("/b") b(ctx: IKoaContext) {
 *   }
 * }
 * ```
 */
export const router = Meta.decoratorWithOptions<IRouterOptions | string>(RouterDecorator);
