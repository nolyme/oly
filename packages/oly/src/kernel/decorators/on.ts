import { IDecorator } from "../../metadata/interfaces";
import { Meta } from "../../metadata/Meta";
import { olyCoreKeys } from "../constants/keys";

export class OnDecorator implements IDecorator {

  public constructor(private name: string) {
  }

  public asMethod(t: object, p: string): void {
    Meta.of({key: olyCoreKeys.events, target: t, propertyKey: p}).set({
      name: this.name,
    });
  }

  public asProperty(t: object, p: string): void {
    this.asMethod(t, p);
  }
}

/**
 * Event listener decorator.  This is based on Kernel#on().
 *
 * ```ts
 * class A {
 *   @on b() { // event name is optional, default = `${Class.name}.${propertyKey}`
 *     console.log("Hey");
 *   }
 * }
 * Kernel.create().with(A).emit("A.b");
 * ```
 *
 * ### Stop watching
 *
 * You don't need to free() events on services. Like events, services are stored in the kernel
 * so when kernel dies, services die and events are deleted.
 *
 * This is not the case with factories like React components, which are created / destroyed on the fly.
 * To handle this case, any class which use @on will automatically implement IListener.
 * This interface gives you the `__free__()` method, useful to remove events.
 *
 * ```ts
 * const a = Kernel.create().get(A);
 * a.__free__();
 * ```
 */
export const on = Meta.decorator<string>(OnDecorator);
