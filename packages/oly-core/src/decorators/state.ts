import { lyStates } from "../constants/keys";
import { IVirtualStateMetadataMap } from "../interfaces/store";
import { MetadataUtil } from "../utils/MetadataUtil";

/**
 * Set data into the store.
 * ```typescript
 * class A {
 *  @state s1: object;
 *  // or
 *  @state("S2") s2: object;
 * }
 * ```
 * @param name            Name of the store key, default is `${definition.name}.${name}`
 * @param propertyKey     ~
 */
export const state = (name?: object | string, propertyKey?: string): any => {
  if (!!propertyKey && typeof name === "object") {
    return $state()(name, propertyKey);
  }
  return $state(name as string);
};

const $state = (name?: string): PropertyDecorator => (target: object, propertyKey: string): void => {

  const states: IVirtualStateMetadataMap = MetadataUtil.get(lyStates, target.constructor);

  states[propertyKey] = {
    readonly: false,
    name,
  };

  MetadataUtil.set(lyStates, states, target.constructor);
};
