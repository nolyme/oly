import { IDecorator, Meta } from "oly-core";
import { olyReactKeys } from "../constants/keys";

export interface IActionOptions {
  name?: string;
}

export class ActionDecorator implements IDecorator {

  private options: IActionOptions;

  public constructor(options: IActionOptions | string = {}) {
    if (typeof options === "string") {
      this.options = {name: options};
    } else {
      this.options = options;
    }
  }

  public asMethod(target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>): void {
    Meta.of({key: olyReactKeys.actions, target, propertyKey}).set({
      name: this.options.name || propertyKey,
    });
  }

  public asProperty(target: Object, propertyKey: string): void {
    this.asMethod(target, propertyKey, {});
  }
}

export const action = Meta.decorator<IActionOptions>(ActionDecorator);
