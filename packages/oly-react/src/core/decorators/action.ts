import { CommonUtil, MetadataUtil } from "oly-core";
import { lyActions } from "../constants";

/**
 * Bind function and handle exceptions.
 */
export const action = (target: object | string, propertyKey?: string): any => {

  if (typeof target === "object" && !!propertyKey) {
    return $action(null)(target, propertyKey);
  }

  return $action(target as string);
};

const $action = (name: string | null) => (target2: any, propertyKey2: string) => {

  const actions = MetadataUtil.get(lyActions, target2.constructor);

  actions[propertyKey2] = name || CommonUtil.targetToString(target2.constructor, propertyKey2);

  MetadataUtil.set(lyActions, actions, target2.constructor);
};
