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
 *
 * Replace the given property by a virtual getter of [Kernel#env()](#/m/oly-core/s/Kernel/env).
 * <br/>
 *
 * > This is based on [@state](#/m/oly-core/@/state), but it's always **readonly**.
 * An error will be thrown if no value was found.
 *
 * <br/>
 * ```ts
 * class A {
 *
 *   @env("B")
 *   b: string = "defaultValue"
 * }
 *
 * Kernel.create({B: "c"}).get(A).b; // c
 * ```
 */
export const env = Meta.decoratorWithOptions<string>(EnvDecorator);
