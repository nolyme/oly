import { IDecorator, Meta } from "oly-core";
import { olyRouterKeys } from "../constants/keys";
import { IRouterProperty } from "../interfaces";

export type IRouteOptions = Partial<IRouterProperty>;

export class RouteDecorator implements IDecorator {

  private options: IRouteOptions;

  public constructor(options: IRouteOptions | string = {}) {
    if (typeof options === "string") {
      this.options = {
        path: options,
      };
    } else {
      this.options = options;
    }
  }

  public asMethod(target: object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>): void {
    Meta.of({key: olyRouterKeys.router, target, propertyKey}).set({
      method: this.options.method || "GET",
      path: this.options.path || "/",
      api: this.options.api || {},
      middlewares: this.options.middlewares || [],
    });
  }

  public asProperty(target: object, propertyKey: string): void {
    this.asMethod(target, propertyKey, {});
  }
}

export const route = Meta.decoratorWithOptions<IRouteOptions>(RouteDecorator);
