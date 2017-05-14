import { IMetaArray } from "../interfaces";
import { field } from "./field";

/**
 *
 */
export const array = (options: IMetaArray): PropertyDecorator => {
  return (target: object, propertyKey: string) => {
    return field({
      ...options,
      type: Array,
    })(target, propertyKey);
  };
};
