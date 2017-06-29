import { IDecorator, Kernel, Meta, olyCoreKeys, TypeParser } from "oly-core";
import { ITransition } from "../interfaces";

export interface IParamOptions {
  name?: string;
}

export class ParamDecorator implements IDecorator {

  private options: IParamOptions;

  public constructor(options: IParamOptions | string = {}) {
    if (typeof options === "string") {
      this.options = {name: options};
    } else {
      this.options = options;
    }
  }

  public asParameter(target: object, propertyKey: string, index: number): void {
    const name = this.options.name || Meta.getParamNames(target[propertyKey])[index];
    const type = Meta.designParamTypes(target, propertyKey)[index];
    Meta.of({key: olyCoreKeys.arguments, target, propertyKey, index}).set({
      type: Meta.designParamTypes(target, propertyKey)[index] as any,
      handler: (k: Kernel, [transition]: [ITransition]) => {
        return TypeParser.parse(type, transition.to.params[name]);
      },
    });
  }
}

/**
 * Extract path param from page url.
 *
 * ```ts
 *  class A {
 *
 *    @page("/:id")
 *    home(@param("id") id: string) {
 *      return <div>{id}</div>
 *    }
 *  }
 * ```
 */
export const param = Meta.decorator<IParamOptions | string>(ParamDecorator);
