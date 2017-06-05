import { IDecorator, Meta } from "oly-core";
import { olyRouterKeys } from "../constants/keys";

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
    Meta.of({key: olyRouterKeys.router, target}).set({
      prefix: this.options.prefix || "/",
    });
  }
}

/**
 *
 */
export const router = Meta.decoratorWithOptions<IRouterOptions>(RouterDecorator);
