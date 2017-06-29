import { IDecorator, Kernel, Meta, olyCoreKeys, TypeParser } from "oly-core";
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
    const type = Meta.designParamTypes(target, propertyKey)[index];
    Meta.of({key: olyCoreKeys.arguments, target, propertyKey, index}).set({
      type: Meta.designParamTypes(target, propertyKey)[index] as any,
      handler: (k: Kernel, [transition]: [ITransition]) => {
        // /a?b -> b = true if Boolean
        if (transition.to.query[name] === "" && type === Boolean) {
          return true;
        }
        return TypeParser.parse(type, transition.to.query[name]);
      },
    });
  }
}

/**
 * Extract query param from page url.
 *
 * ```ts
 *  class A {
 *
 *    @page("/")
 *    home(@query("from") from: string) {
 *      return <div>Hello from {from}</div>
 *    }
 *  }
 * ```
 */
export const query = Meta.decorator<IQueryOptions | string>(QueryDecorator);
