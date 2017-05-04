import { lyEvents } from "../constants/keys";
import { IEventMetadataMap } from "../interfaces/events";
import { MetadataUtil } from "../utils/MetadataUtil";

/**
 * Attach a event listener to the method.
 * By default, event name equals
 *
 * ```typescript
 * class A {
 *   @on("HI") sayHello() {}
 *   // or
 *   @on yolo() {}
 * }
 * kernel.emit("HI");
 * kernel.emit("A.yolo");
 * ```
 *
 * @param name          Optional event name, default is `${definition.name}.${name}`
 * @param propertyKey   ~
 */
export const on = (name?: object | string, propertyKey?: string): any => {
  if (!!propertyKey && typeof name === "object") {
    return $on()(name, propertyKey);
  }
  return $on(name as string);
};

const $on = (name?: string): PropertyDecorator => (target: object, propertyKey: string): void => {

  const events: IEventMetadataMap = MetadataUtil.get(lyEvents, target.constructor);

  events[propertyKey] = {
    name,
  };

  MetadataUtil.set(lyEvents, events, target.constructor);
};
