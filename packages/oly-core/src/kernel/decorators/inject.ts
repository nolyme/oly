import { IDecorator } from "../../decorator/interfaces";
import { Meta } from "../../decorator/Meta";
import { olyCoreKeys } from "../constants/keys";
import { IAnyFunction } from "../interfaces/global";
import { Kernel } from "../Kernel";

export interface IInjectOptions {
  type?: IAnyFunction;
}

export class InjectDecorator implements IDecorator {

  private options: IInjectOptions;

  public constructor(options: IInjectOptions | IAnyFunction = {}) {
    if (typeof options === "function") {
      this.options = {
        type: options,
      };
    } else {
      this.options = options;
    }
  }

  public asProperty(t: object, p: string): void {
    Meta.of({key: olyCoreKeys.injections, target: t, propertyKey: p}).set({
      type: this.options.type || Meta.designType(t, p),
    });
  }

  public asParameter(t: object, p: string, i: number): void {
    Meta.of({key: olyCoreKeys.arguments, target: t, propertyKey: p, index: i}).set({
      type: this.options.type || Meta.designParamTypes(t, p)[i] as any,
      handler: (k: Kernel) => k.get(this.options.type || Meta.designParamTypes(t, p)[i] as any),
    });
  }
}

/**
 *
 */
export const inject = Meta.decorator<IInjectOptions>(InjectDecorator);
