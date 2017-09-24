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
 * Event listener decorator. See Kernel#on().
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
 * You don't need to free() events on services.
 * Like events, services are stored in the kernel so when kernel dies, services die too then events are deleted.
 *
 * However, this is not the case with volatiles like React components, which are created / destroyed on the fly.
 * To handle this case, any class using @on will automatically implement IListener.
 * This interface gives the `__free__()` method, useful to remove events.
 *
 * ```ts
 * class A { @on b = () => console.log("ok") }
 * const k = Kernel.create();
 * const a = k.get(A) as IListener;
 *
 * await k.emit("A.b"); // "ok"
 * a.__free__!();
 * await k.emit("A.b"); // ...
 * ```
 *
 * ### Syntactic sugar
 *
 * ```ts
 * // with @decorator
 * class A {
 *   @on("B") b() { console.log("hi") };
 * }
 *
 * // without @decorator
 * class A {
 *   constructor(private kernel: Kernel) {
 *     const ev = this.kernel.on("B", args => this.kernel.invoke(A, "b", [args]));
 *     this.__free__ = ev.free;
 *   }
 *   b() { console.log("hi") };
 * }
 * ```
 */
export const on = Meta.decorator<string>(OnDecorator);
