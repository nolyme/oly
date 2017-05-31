import { CommonUtil, MetadataUtil } from "oly-core";
import { lyActions } from "../constants";
import { IActionMetadataMap } from "../interfaces";

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

  const actions: IActionMetadataMap = MetadataUtil.get(lyActions, target2.constructor);
  const newName = name || CommonUtil.identity(target2.constructor, propertyKey2);

  if (!actions[propertyKey2]) {
    actions[propertyKey2] = {
      name: newName,
    };
  } else {
    actions[propertyKey2].name = newName;
  }

  MetadataUtil.set(lyActions, actions, target2.constructor);
};
