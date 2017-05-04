import { MetadataUtil } from "oly-core";
import { lyActions } from "../constants";

/**
 * Bind function and handle exceptions.
 *
 * @decorator
 */
export const action = (target: object | string, propertyKey?: string): any => {

  const $action = (name: string | null) => (target2: object, propertyKey2: string) => {

    const actions = MetadataUtil.get(lyActions, target2.constructor);

    actions[propertyKey2] = name || `${(target2.constructor as any).name}.${propertyKey2}`;

    MetadataUtil.set(lyActions, actions, target2.constructor);
  };

  if (typeof target === "object" && !!propertyKey) {
    return $action(null)(target, propertyKey);
  }

  return $action(target as string);
};
