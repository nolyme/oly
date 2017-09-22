import { IDecorator } from "../../metadata/interfaces";
import { Meta } from "../../metadata/Meta";
import { olyCoreKeys } from "../constants/keys";
import { _ } from "../Global";
import { Kernel } from "../Kernel";

export class StateDecorator implements IDecorator {

  public constructor(private name: string) {
  }

  public asProperty(t: object, p: string): void {
    Meta.of({key: olyCoreKeys.states, target: t, propertyKey: p}).set({
      readonly: false,
      name: this.name,
      type: Meta.designType(t, p),
    });
  }

  public asParameter(t: object, p: string, i: number): void {
    Meta.of({key: olyCoreKeys.arguments, target: t, propertyKey: p, index: i}).set({
      handler: (k: Kernel) => {
        return k.state(this.name || _.identity(t.constructor, p));
      },
    });
  }
}

/**
 * Get'n'Set a value from the store.
 * This is based on Kernel#state().
 *
 * ```ts
 * class A {
 *   @state data: string; // state name is optional, default = `${Class.name}.${propertyKey}`
 * }
 *
 * Kernel
 *   .create({
 *     "A.data", "Hello" // key,value
 *   })
 *   .get(A)
 *   .data; // "Hello"
 * ```
 *
 * ### Event
 *
 * Each "mutation" will emit `oly:state:mutate`.
 *
 * ```ts
 * class Engine {
 *   @state started = false;
 *
 *   active() {
 *     this.started = true;
 *   }
 * }
 *
 * Kernel
 *   .create()
 *   .on("oly:state:mutate", (ev) => {
 *     console.log(ev.key, ev.oldValue, ev.newValue);
 *   })
 *   .kernel
 *   .get(Engine)
 *   .active();
 * ```
 *
 * ### Syntactic sugar
 *
 * ```ts
 * // with @decorator
 * class A {
 *   @state("B") b: string;
 * }
 *
 * // without @decorator
 * class A {
 *   constructor(private kernel: Kernel) {}
 *   get b() {
 *     return this.kernel.state("B");
 *   }
 *   set b(val) {
 *     this.kernel.state("B", val);
 *   }
 * }
 * ```
 */
export const state = Meta.decorator<string>(StateDecorator);
