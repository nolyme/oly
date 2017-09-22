import { IDecorator } from "../../metadata/interfaces";
import { Meta } from "../../metadata/Meta";
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
      handler: (k: Kernel) => k.inject(this.options.type || Meta.designParamTypes(t, p)[i] as any),
    });
  }
}

/**
 * Create or re-use a service. This is based on Kernel#inject().
 *
 * ```ts
 * class B {
 *   c = "d";
 * }
 *
 * class A {
 *   @inject b: B;
 * }
 *
 * Kernel.create().get(A).b.c // "d"
 * ```
 *
 * Type can be passed by argument.
 * ```ts
 * class A {
 *   @inject(B) b;
 *   @inject(B2) b: B; // this works too
 * }
 * ```
 *
 * ### Syntactic sugar
 *
 * ```ts
 * // with @decorator
 * class A {
 *   @inject b: B;
 * }
 *
 * // without @decorator
 * class A {
 *   constructor(private kernel: Kernel) {}
 *   get b() {
 *     return this.kernel.inject(B);
 *   }
 * }
 * ```
 */
export const inject = Meta.decorator<IInjectOptions>(InjectDecorator);
