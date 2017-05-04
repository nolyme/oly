import { designType, MetadataUtil } from "oly-core";
import { IField } from "../interfaces";
import { FieldMetadataUtil } from "../utils/FieldMetadataUtil";
import { array } from "./array";

/**
 * Add a field to the target schema.
 *
 * ```ts
 * class Data {
 *    @field() name: string;
 * }
 * ```
 *
 * @param options   IField options
 */
export const field = (options: IField = {}): PropertyDecorator => {
  return (target: object, propertyKey: string) => {

    options.name = options.name || propertyKey;
    options.of = options.of || MetadataUtil.getProp(designType, target, propertyKey, null);
    options.type = options.type || FieldMetadataUtil.findTypeName(options.of);

    if (options.of === Date) {
      options.type = "string";
      options.format = "date-time";
    }

    if (options.of === Array) {
      return array({of: null})(target, propertyKey);
    }

    if (options.required == null) {
      options.required = true;
    }

    const fields = FieldMetadataUtil.getFields(target.constructor);

    fields.push(options);

    MetadataUtil.set(FieldMetadataUtil.lyFields, fields, target.constructor);
  };
};
