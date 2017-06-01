import { IDecorator, Meta } from "oly-core";
import { olyRouterKeys } from "oly-router";
import { IRouteApi } from "../interfaces";

export type IApiOptions = Partial<IRouteApi>;

export class ApiDecorator implements IDecorator {

  public constructor(private options: IApiOptions = {}) {
  }

  public asMethod(target: object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>): void {
    Meta.of({key: olyRouterKeys.router, target, propertyKey}).set({
      api: this.options,
    });
  }

  public asProperty(target: object, propertyKey: string): void {
    this.asMethod(target, propertyKey, {});
  }
}

export const api = Meta.decoratorWithOptions<IApiOptions>(ApiDecorator);
