import * as ajv from "ajv";
import { IClass, IClassOf } from "oly-core";
import { IField, IJsonSchema } from "./interfaces";
import { FieldMetadataUtil } from "./utils/FieldMetadataUtil";

/**
 * Allow to parse object and array of objects
 */
export class ObjectMapper {

  public static keywords = [
    "ignore",
    "description",
    "type",
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
  ];

  public ajv: ajv.Ajv;

  /**
   * Sanitize then validate then map an object.
   * Accept array of objects.
   *
   * @param type
   * @param data
   */
  public parse<T>(type: IClassOf<T>, data: object[]): T[];
  public parse<T>(type: IClassOf<T>, data: object | string): T;
  public parse<T>(type: IClassOf<T>, data: any) {

    if (typeof data === "string") {
      data = JSON.parse(data);
    }

    return this.map(type,
      this.validate(type,
        this.sanitize(type, data)));
  }

  /**
   * Transform json into class.
   *
   * @param type    Class definition
   * @param data    Json data
   */
  public map<T>(type: IClassOf<T>, data: object[]): T[];
  public map<T>(type: IClassOf<T>, data: object): T;
  public map<T>(type: IClassOf<T>, data: any) {
    if (Array.isArray(data)) {
      return data.map((d) => this.mapClass(type, d));
    } else {
      return this.mapClass(type, data);
    }
  }

  /**
   * JsonSchema validator based on ajv.
   *
   * @param type   Class definition with JsonSchema
   * @param data   Json data
   */
  public validate<T, V>(type: IClassOf<T>, data: V[]): V[];
  public validate<T, V>(type: IClassOf<T>, data: V): V;
  public validate<T>(type: IClassOf<T>, data: any) {
    if (Array.isArray(data)) {
      return data.map((d) => this.validateClass(type, d));
    } else {
      return this.validateClass(type, data);
    }
  }

  /**
   * Sanitize object.
   *
   * @param type    Class definition
   * @param data    Json data
   */
  public sanitize<T, V>(type: IClassOf<T>, data: V[]): V[];
  public sanitize<T, V>(type: IClassOf<T>, data: V): V;
  public sanitize<T>(type: IClassOf<T>, data: any) {
    if (Array.isArray(data)) {
      return data.map((d) => this.sanitize(type, d));
    } else {
      return this.sanitizeClass(type, data);
    }
  }

  /**
   * Extract JsonSchema from class definition.
   *
   * @param type
   * @return {Object}
   */
  public schema<T>(type: IClassOf<T>): IJsonSchema {
    return this.extractSchema(type);
  }

  /**
   * Ajv factory.
   */
  protected createAjv(): ajv.Ajv {
    return new ajv({ useDefaults: true });
  }

  /**
   * Poop exception on validator error.
   *
   * @param validate
   */
  protected throwValidationError(validate: ajv.ValidateFunction): any {
    const error: any = new Error(`Validation has failed (${this.ajv.errorsText(validate.errors)})`);
    error.details = validate.errors;
    throw error;
  }

  /**
   *
   * @param Target
   * @param data
   * @return {any}
   */
  protected validateClass<T>(Target: IClassOf<T>, data: any) {

    this.ajv = this.ajv || this.createAjv();

    const schema = this.extractSchema(Target);
    const validate = this.ajv.compile(schema);
    const valid = validate(data);

    if (!valid) {
      this.throwValidationError(validate);
    }

    return data;
  }

  /**
   * Unmarshal object to class based on definition
   *
   * @param Target
   * @param data
   */
  protected mapClass<T>(Target: IClassOf<T>, data: object): T {

    const target = new Target();
    const fields = FieldMetadataUtil.getFields(Target);

    for (const field of fields) {

      if (!field.name) {
        continue;
      }

      if (data[field.name] != null) {

        if (!!field.of && FieldMetadataUtil.hasFields(field.of)) {
          if (field.type === "array") {
            target[field.name] = data[field.name].map((item: any) =>
              field.of ? this.mapClass(field.of, item) : item);
          } else {
            target[field.name] = field.of ? this.mapClass(field.of, data[field.name]) : data[field.name];
          }
        } else {
          target[field.name] = data[field.name];
        }

        if (field.type === "string" && field.format === "date-time") {
          target[field.name] = new Date("" + data[field.name]);
        }
      }
    }

    return target;
  }

  /**
   * Sanitize all fields of an object based on the definition.
   *
   * @param Target
   * @param data
   */
  protected sanitizeClass(Target: IClass, data: object) {

    const fields = FieldMetadataUtil.getFields(Target);
    const target = {};

    for (const field of fields) {

      if (!field.name) {
        continue;
      }

      if (data[field.name] != null) {
        if (!!field.of && FieldMetadataUtil.hasFields(field.of)) {
          if (field.type === "array") {
            target[field.name] = data[field.name]
              .map((item: any) => this.sanitizeClass(field.of as any, item));
          } else {
            target[field.name] = this.sanitizeClass(field.of, data[field.name]);
          }
        } else if (field.type === "string") {
          if (field.format === "date-time" && data[field.name] instanceof Date) {
            target[field.name] = data[field.name].toISOString();
          } else {
            target[field.name] = this.sanitizeString(data[field.name], field);
          }
        } else {
          target[field.name] = data[field.name];
        }
      }
    }

    return target;
  }

  /**
   * Sanitize a string field
   *
   * @param value
   * @param field
   * @returns {string}
   */
  protected sanitizeString(value: string, field: IField): string {

    if (typeof value !== "string") {
      throw new Error(`field '${field.name}' must be a string, current is '${typeof value}'`);
    }

    if (field.trim !== false) {
      value = value.trim();
    }

    if (field.upper === true) {
      value = value.toUpperCase();
    }

    if (field.lower === true) {
      value = value.toLowerCase();
    }

    return value;
  }

  /**
   *
   * @param Target
   * @return {any}
   */
  protected extractSchema(Target: IClass): IJsonSchema {

    const fields = FieldMetadataUtil.getFields(Target);

    const jsonSchema: IJsonSchema = {
      name: Target.name,
      properties: {},
      type: "object",
    };

    for (const field of fields) {

      if (!field.name) {
        continue;
      }

      jsonSchema.properties = jsonSchema.properties || {};

      if (!!field.of && FieldMetadataUtil.hasFields(field.of)) {
        if (field.type === "array") {
          jsonSchema.properties[field.name] = this.onlyAllowedKeywords(field);
          jsonSchema.properties[field.name].items = [this.extractSchema(field.of)];
        } else {
          jsonSchema.properties[field.name] = this.extractSchema(field.of);
        }
      } else {
        jsonSchema.properties[field.name] = this.onlyAllowedKeywords(field);
      }

      if (field.required) {
        jsonSchema.required = jsonSchema.required || [];
        jsonSchema.required.push(field.name);
      }
    }

    return jsonSchema;
  }

  /**
   *
   * @param data
   * @return {{}}
   */
  protected onlyAllowedKeywords(data: object): object {
    return Object.keys(data).reduce((result, key) => {
      if (ObjectMapper.keywords.indexOf(key) > -1) {
        result[key] = data[key];
      }
      return result;
    }, {});
  }
}
