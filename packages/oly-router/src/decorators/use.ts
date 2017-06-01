import { IDecorator, Meta } from "oly-core";
import { olyRouterKeys } from "../constants/keys";

export type IUseOptions = Function;

export class UseDecorator implements IDecorator {

  private options: Function;

  public constructor(options: Function) {
    this.options = options;
  }

  public asClass(target: Function): void {
    Meta.of({key: olyRouterKeys.router, target}).set({
      middlewares: [this.options],
    });
  }

  public asMethod(target: object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>): void {
    Meta.of({key: olyRouterKeys.router, target, propertyKey}).set({
      middlewares: [this.options],
    });
  }
}

export const use = Meta.decoratorWithOptions<IUseOptions>(UseDecorator);
