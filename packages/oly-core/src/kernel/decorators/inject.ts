import { IDecorator } from "../../meta/interfaces";
import { Meta } from "../../meta/Meta";
import { olyCoreKeys } from "../constants/keys";
import { Class } from "../interfaces/injections";
import { Kernel } from "../Kernel";

export interface IInjectOptions {
  type?: Class;
}

export class InjectDecorator implements IDecorator {

  private options: IInjectOptions;

  public constructor(options: IInjectOptions | Class = {}) {
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
 * Inject a service.
 *
 * ```ts
 * class B {
 *   c = "d";
 * }
 *
 * class A {
 *  @inject b: B;
 * }
 *
 * Kernel.create().get(A).b.c // "d"
 * ```
 *
 * You can force the Type.
 * ```ts
 * class A {
 *   @inject(B) b;
 *   @inject({type: C}): c;
 * }
 * ```
 *
 * It works also on constructor with Kernel#invoke().
 *
 * ```ts
 * class B {}
 * class A {
 *   constructor(@inject b: B) {}
 * }
 * ```
 *
 * > You don't have to set @inject if your service has @injectable.
 *
 */
export const inject = Meta.decorator<IInjectOptions>(InjectDecorator);
