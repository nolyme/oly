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
 * ## Free
 *
 * You don't need to free() events on services. Like events, services are stored in the kernel.
 * When the kernel dies, services die so events are erased too.
 *
 * It's not the case for React components, which are create / destroy on the fly.
 * To handle this case, any class which use @on will automatically implements IListener.
 * This interface gives you the __free__() method, useful to remove events.
 */
export const on = Meta.decorator<string>(OnDecorator);
