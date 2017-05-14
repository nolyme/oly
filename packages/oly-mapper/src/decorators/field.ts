import { MetadataUtil } from "oly-core";
import { IField, IType } from "../interfaces";
import { FieldMetadataUtil } from "../utils/FieldMetadataUtil";

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
export const field = (options: Partial<IField> | IType = {}): PropertyDecorator => {
  return (target: object, propertyKey: string) => {

    const fields = FieldMetadataUtil.getFields(target.constructor);
    const partial: Partial<IField> = typeof options === "function" ? {type: options} : options;

    fields.push({
      name: partial.name || propertyKey,
      required: partial.required !== false,
      type: partial.type || MetadataUtil.getPropType(target, propertyKey),
      ...partial,
    });

    MetadataUtil.set(FieldMetadataUtil.lyFields, fields, target.constructor);
  };
};
