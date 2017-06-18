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
        const type = Meta.designParamTypes(target, propertyKey)[index];
        if (type === Boolean) {
          return !(
          transition.to.query[name] == null
          || transition.to.query[name] === "0"
          || transition.to.query[name] === "false");
        } else if (type === Number) {
          if (transition.to.query[name] == null) {
            return transition.to.query[name];
          }
          if (transition.to.query[name] === "") {
            return null;
          }
          return Number(transition.to.query[name]);
        } else if (type === String) {
          return String(transition.to.query[name]);
        } else {
          return transition.to.query[name];
        }
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
export const query = Meta.decorator<IQueryOptions>(QueryDecorator);
