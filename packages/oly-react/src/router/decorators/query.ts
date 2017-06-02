import { IDecorator, Kernel, Meta, olyCoreKeys } from "oly-core";
import { ITransition } from "../interfaces";

export interface IQueryOptions {
  name?: string;
}

export class QueryDecorator implements IDecorator {

  private options: IQueryOptions;

  public constructor(options: IQueryOptions | string = {}) {
    if (typeof options === "string") {
      this.options = {name: options};
    } else {
      this.options = options;
    }
  }

  public asParameter(target: object, propertyKey: string, index: number): void {
    const name = this.options.name || Meta.getParamNames(target[propertyKey])[index];
    Meta.of({key: olyCoreKeys.arguments, target, propertyKey, index}).set({
      type: Meta.designParamTypes(target, propertyKey)[index] as any,
      handler: (k: Kernel, [transition]: [ITransition]) => {
        return transition.to.query[name];
      },
    });
  }
}

/**
 *
 */
export const query = Meta.decorator<IQueryOptions>(QueryDecorator);
