import { Class, inject } from "oly-core";
import { IJsonSchema } from "./interfaces";
import { JsonMapper } from "./services/JsonMapper";
import { JsonSanitizer } from "./services/JsonSanitizer";
import { JsonSchemaReader } from "./services/JsonSchemaReader";
import { JsonValidator } from "./services/JsonValidator";

/**
 * Allow to parse object and array of objects
 */
export class JsonService {

  @inject
  protected mapper: JsonMapper;

  @inject
  protected sanitizer: JsonSanitizer;

  @inject
  protected validator: JsonValidator;

  @inject
  protected schemaReader: JsonSchemaReader;

  /**
   * Like JSON.parse.
   *
   * @param data    Raw (string or object)
   * @return        Json object
   */
  public parse(data: string | object): object {
    if (typeof data === "string") {
      return JSON.parse(data);
    }
    return data;
  }

  /**
   * Like JSON.stringify.
   *
   * @param data    Json (string or object)
   * @return        Json string
   */
  public stringify(data: string | object): string {
    if (typeof data === "object") {
      return JSON.stringify(data);
    }
    return data;
  }

  /**
   * Transform json into class.
   *
   * @param type    Class definition
   * @param data    Json data
   * @return        Mapped object
   */
  public map<T extends object>(type: Class<T>, data: object): T {
    return this.mapper.mapClass(type, data);
  }

  /**
   *  Validator based on ajv.
   *  Data can be updated (depend on ajv configuration).
   *
   * @param type   Class definition with JsonSchemaReader
   * @param data   Json data
   * @return       Data after validation if valid
   */
  public validate<T extends object>(type: Class, data: T): T {
    return this.validator.validateClass(type, data);
  }

  /**
   * Sanitize object.
   *
   * @param type    Class definition
   * @param data    Json data
   * @return        Sanitized data
   */
  public sanitize<T extends object>(type: Class<T>, data: T): T {
    return this.sanitizer.sanitizeClass(type, data);
  }

  /**
   * Parse, sanitize, validate and map.
   *
   * @param type    Class definition
   * @param data    Raw data (string or object)
   */
  public build<T extends object>(type: Class<T>, data: string | object): T {
    return this.sanitize(type, this.map(type, this.validate(type, this.parse(data))));
  }

  /**
   * Extract JsonSchemaReader from class definition.
   *
   * @param type    Definition
   * @return        JsonSchema
   */
  public schema<T extends object>(type: Class<T>): IJsonSchema {
    return this.schemaReader.extractSchema(type);
  }
}
