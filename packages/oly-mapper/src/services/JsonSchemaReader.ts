import { IClass } from "oly-core";
import { IField, IJsonSchema, IMetaArray } from "../interfaces";
import { FieldMetadataUtil } from "../utils/FieldMetadataUtil";

export class JsonSchemaReader {

  public static readonly keywords = [
    "ignore",
    "description",
    "minimum",
    "exclusiveMinimum",
    "maximum",
    "exclusiveMaximum",
    "multipleOf",
    "minLength",
    "maxLength",
    "format",
    "pattern",
    "minItems",
    "maxItems",
    "uniqueItems",
    "default",
    "additionalProperties",
    "enum"
  ];

  /**
   * Extract JsonSchema from class definition.
   *
   * @param definition    Class definition
   * @return              JsonSchema
   */
  public extractSchema(definition: IClass): IJsonSchema {

    const fields = FieldMetadataUtil.getFields(definition);
    const jsonSchema: IJsonSchema = {
      name: definition.name,
      type: "object",
    };
    jsonSchema.properties = {};

    for (const field of fields) {
      jsonSchema.properties[field.name] = this.extractProperty(field);
      if (field.required) {
        jsonSchema.required = jsonSchema.required || [];
        jsonSchema.required.push(field.name);
      }
    }

    return jsonSchema;
  }

  public extractProperty(field: IField): IJsonSchema {

    const jsonSchema: IJsonSchema = this.extractJsonSchemaKeywords(field);

    jsonSchema.type = FieldMetadataUtil.getFieldType(field.type);

    if (jsonSchema.type === "object" && FieldMetadataUtil.hasFields(field.type)) {
      if (FieldMetadataUtil.hasFields(field.type)) {
        return this.extractSchema(field.type as IClass);
      } else if (!!field.type.prototype.toJSON) {
        // object -> string (for Object.toJSON() like Date)
        jsonSchema.type = "string";
      }
    }

    if (jsonSchema.type === "array") {
      const array = field as IMetaArray;
      const item: IField = typeof array.of === "function" ? {type: array.of, name: ""} : array.of;
      jsonSchema.items = [this.extractProperty(item)];
    }

    return jsonSchema;
  }

  /**
   *
   * @param data
   * @return {{}}
   */
  protected extractJsonSchemaKeywords(data: object): object {
    return Object.keys(data).reduce((result, key) => {
      if (JsonSchemaReader.keywords.indexOf(key) > -1) {
        result[key] = data[key];
      }
      return result;
    }, {});
  }
}
