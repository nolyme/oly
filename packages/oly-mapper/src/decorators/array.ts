import { MetadataUtil } from "oly-core";
import { IArrayField } from "../interfaces";
import { FieldMetadataUtil } from "../utils/FieldMetadataUtil";

/**
 * Like @field but for array.
 *
 * @param options
 */
export const array = (options: IArrayField): PropertyDecorator => {
  return (target: object, propertyKey: string) => {

    options.type = "array";
    options.name = options.name || propertyKey;

    if (options.required == null) {
      options.required = true;
    }

    const fields = FieldMetadataUtil.getFields(target.constructor);

    fields.push(options);

    MetadataUtil.set(FieldMetadataUtil.lyFields, fields, target.constructor);
  };
};
