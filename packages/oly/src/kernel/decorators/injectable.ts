import { IDecorator } from "../../metadata/interfaces";
import { Meta } from "../../metadata/Meta";
import { olyCoreKeys } from "../constants/keys";
import { Class, IFactory } from "../interfaces/injections";
import { Kernel } from "../Kernel";

export interface IInjectableOptions {
  singleton?: boolean;
  use?: IFactory<any>;
  provide?: Class<any>;
}

export class InjectableDecorator implements IDecorator {

  private options: IInjectableOptions;

  public constructor(options: IInjectableOptions = {}) {
    this.options = options;
  }

  public asClass(t: Function): void {

    Meta.of({key: olyCoreKeys.injectable, target: t}).set(this.options);

    const paramTypes = Meta.designParamTypes(t, "$constructor");
    if (paramTypes) {
      for (let i = 0; i < paramTypes.length; i++) {
        const meta = Meta.of({key: olyCoreKeys.arguments, target: t.prototype, propertyKey: "$constructor", index: i});
        const data = meta.get();
        if (!data || !data.args || !data.args.$constructor || !data.args.$constructor[i]) {
          meta.set({
            type: paramTypes[i],
            handler: (k: Kernel) => k.inject(paramTypes[i] as Class),
          });
        }
      }
    }
  }
}

/**
 * Configure a service and enable constructor auto-injection.
 *
 * ```ts
 * &shy;@injectable({
 *   singleton: true,
 * })
 * class A {
 * }
 * ```
 *
 * Auto inject constructor. This is not recommended.
 *
 * ```ts
 * &shy;@injectable
 * class A {
 *   constructor(
 *     private b: B
 *   ) {}
 * }
 * ```
 */
export const injectable = Meta.decorator<IInjectableOptions>(InjectableDecorator);
