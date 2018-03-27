import { Global, Meta } from "oly";
import { olyMapperKeys } from "../constants/keys";
import { IField, IFieldsMetadata, IJsonSchema, IMetaArray, ISchemaMetadata } from "../interfaces";
import { TypeUtil } from "../utils/TypeUtil";

export class JsonSchemaReader {

  public static keywords = [
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
    "enum",
    "$merge",
    "$data",
    "$patch",
  ];

  /**
   * Extract JsonSchema from class definition.
   *
   * @param definition    Class definition
   * @param rootSchema
   * @return              JsonSchema
   */
  public extractSchema(definition: Function, rootSchema: Partial<IJsonSchema> = {}): IJsonSchema {

    let jsonSchema: IJsonSchema = {
      ...rootSchema,
      name: definition.name,
      type: "object",
    };
    jsonSchema.properties = {};

    const fieldsMetadata = Meta.of({key: olyMapperKeys.fields, target: definition}).deep<IFieldsMetadata>();
    if (fieldsMetadata) {

      const keys = Object.keys(fieldsMetadata.properties);
      for (const propertyKey of keys) {
        const field = fieldsMetadata.properties[propertyKey];

        jsonSchema.properties[field.name] = this.extractProperty(field);
        if (field.required) {
          jsonSchema.required = jsonSchema.required || [];
          jsonSchema.required.push(field.name);
        }
      }
    }

    const schemaMetadata = Meta.of({key: olyMapperKeys.schema, target: definition}).deep<ISchemaMetadata>();
    if (schemaMetadata && schemaMetadata.target.transforms) {
      for (const transform of schemaMetadata.target.transforms) {
        if (typeof transform === "function") {
          jsonSchema = (transform(jsonSchema) || jsonSchema);
        } else {
          jsonSchema = Global.merge(jsonSchema, transform);
        }
      }
    }

    return jsonSchema;
  }

  /**
   *
   * @param field
   */
  public extractProperty(field: IField): IJsonSchema {

    const jsonSchema: IJsonSchema = this.extractJsonSchemaKeywords(field);

    jsonSchema.type = TypeUtil.getFieldType(field.type);

    if (jsonSchema.type === "object") {
      if (Meta.of({key: olyMapperKeys.fields, target: field.type}).has()) {
        return this.extractSchema(field.type as Function, jsonSchema);
      } else if (!!field.type.prototype.toJSON) {
        // object -> string (for Object.toJSON() like Date)
        jsonSchema.type = "string";
      }
    }

    if (jsonSchema.type === "array") {
      const array = field as IMetaArray;
      const item: IField = typeof array.of === "function"
        ? {name: "", type: array.of}
        : {name: "", type: Object, ...field.of} as any;

      if (item) {
        jsonSchema.items = this.extractProperty(item);
      }
    }

    return jsonSchema;
  }

  /**
   *
   * @param data
   */
  protected extractJsonSchemaKeywords(data: object): Partial<IJsonSchema> {
    return Object.keys(data).reduce((result, key) => {
      if (JsonSchemaReader.keywords.indexOf(key) > -1) {
        result[key] = data[key];
      }
      return result;
    }, {});
  }
}
