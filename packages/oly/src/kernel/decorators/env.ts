import { IDecorator } from "../../metadata/interfaces";
import { Meta } from "../../metadata/Meta";
import { olyCoreKeys } from "../constants/keys";
import { Kernel } from "../Kernel";

export class EnvDecorator implements IDecorator {

  public constructor(private name: string) {
  }

  public asProperty(t: object, p: string): void {
    const type = Meta.designType(t, p);
    Meta.of({key: olyCoreKeys.states, target: t, propertyKey: p}).set({
      readonly: true,
      name: this.name,
      type,
    });
  }

  public asParameter(t: object, p: string, i: number): void {
    Meta.of({key: olyCoreKeys.arguments, target: t, propertyKey: p, index: i}).set({
      handler: (k: Kernel) => k.env(this.name, Meta.designParamTypes(t, p)[i]),
    });
  }
}

/**
 * Get a value from the store. This is based on Kernel#env().
 *
 * ```ts
 * class A {
 *   @env("MY_ENV_KEY") b: string = "defaultValue";
 * }
 *
 * Kernel
 *   .create(process.env)
 *   .get(A).b;
 * ```
 *
 * This is **readonly**.
 *
 * ```ts
 * class A {
 *   @env("B") b: string;
 * }
 *
 * Kernel.create({B: "c").with(A).b = "d"; // boom
 * ```
 *
 * An error will be thrown if no value was found.
 *
 * ```ts
 * class A {
 *   @env("B") b: string;
 * }
 *
 * Kernel.create().with(A); // boom
 * ```
 *
 * ### Syntactic sugar
 *
 * ```ts
 * // with @decorator
 * class A {
 *   @env("B") b: string;
 * }
 *
 * // without @decorator
 * class A {
 *   constructor(private kernel: Kernel) {}
 *   get b() {
 *     return this.kernel.env("B", String);
 *   }
 * }
 * ```
 */
export const env = Meta.decoratorWithOptions<string>(EnvDecorator);
