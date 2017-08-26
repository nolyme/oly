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
 * Configure router.
 */
export const router = Meta.decoratorWithOptions<IRouterOptions | string>(RouterDecorator);
