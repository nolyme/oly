import { IDecorator } from "../../meta/interfaces";
import { Meta } from "../../meta/Meta";
import { olyCoreKeys } from "../constants/keys";
import { Kernel } from "../Kernel";

export class EnvDecorator implements IDecorator {

  public constructor(private name: string) {
  }

  public asProperty(t: object, p: string): void {
    Meta.of({key: olyCoreKeys.states, target: t, propertyKey: p}).set({
      readonly: true,
      name: this.name,
      type: Meta.designType(t, p),
    });
  }

  public asParameter(t: object, p: string, i: number): void {
    Meta.of({key: olyCoreKeys.arguments, target: t, propertyKey: p, index: i}).set({
      handler: (k: Kernel) => k.env(this.name, Meta.designParamTypes(t, p)[i]),
    });
  }
}

/**
 * It's like @state, but readonly and cast aware.
 * Name is also required. (and with #toLowerCase() please :-D)
 *
 * Note:
 * - Kernel throws an Error is Env has no value.
 *
 * As property. (VIRTUAL GETTER)
 * ```typescript
 * class A { @env("B") b: string = "defaultValue" }
 * ```
 *
 * As parameter.
 * ```typescript
 * class A {
 *   b(@env("C") c: string) {
 *   }
 * }
 * kernel.invoke(A, "b");
 * ```
 *
 * Cast Boolean.
 * ```typescript
 * class A { @env("B") b: boolean }
 * new Kernel({B: "true"}).get(A).b; // true
 * ```
 *
 * Cast Number.
 * ```typescript
 * class A { @env("B") b: number }
 * new Kernel({B: "1"}).get(A).b; // 1
 * ```
 *
 */
export const env = Meta.decoratorWithOptions<string>(EnvDecorator);
