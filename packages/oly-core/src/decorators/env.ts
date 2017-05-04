import { lyStates } from "../constants/keys";
import { IVirtualStateMetadataMap } from "../interfaces/store";
import { MetadataUtil } from "../utils/MetadataUtil";

/**
 * Same as @state but used for configuration.
 * 'env' is readonly, value is defined once.
 *
 * ```ts
 * class A { @env('MY_VAR') myVar: string; }
 * ```
 *
 * @param name  Name of the store key. Required.
 */
export const env = (name: string): PropertyDecorator => (target: object, propertyKey: string) => {

  const states: IVirtualStateMetadataMap = MetadataUtil.get(lyStates, target.constructor);

  states[propertyKey] = {
    readonly: true,
    name,
  };

  MetadataUtil.set(lyStates, states, target.constructor);
};
