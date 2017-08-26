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
 * Event listener decorator.
 *
 * ```ts
 * class A {
 *   @on b() {
 *     console.log("Hey");
 *   }
 * }
 * Kernel.create().with(A).emit("A.b");
 * ```
 *
 * #### Free
 *
 * You don't need to free() events on services. Like events, services are stored in the kernel.
 * When the kernel dies, services die and events are erased.
 *
 * This is not the case for React components, which are mount / unmount on the way.
 * To handle this case, ANY class which use @on will implement IListener.
 * This interface gives you the __free__() method, useful to remove events.
 *
 * > @attach will __free__() components for you.
 */
export const on = Meta.decorator<string>(OnDecorator);
