import { Class, inject } from "oly";
import { IJsonSchema } from "../interfaces";
import { JsonMapper } from "./JsonMapper";
import { JsonSanitizer } from "./JsonSanitizer";
import { JsonSchemaReader } from "./JsonSchemaReader";
import { JsonValidator } from "./JsonValidator";

/**
 * Allow to parse object and array of objects
 */
export class Json {

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
   *  Result can be different (depend on ajv configuration).
   *
   *  ```ts
   *  class Data {
   *    @field name: string;
   *  }
   *
   *  const validData = this.json.validate(Data, {name: "Jean"});
   *  ```
   *
   * @param type   Class definition with JsonSchemaReader
   * @param data   Json data
   * @return       Data after validation if valid
   */
  public validate<T extends object>(type: Class, data: T): T {
    return this.validator.validateClass(type, data);
  }

  /**
   * Sanitize data.
   *
   * ```ts
   * class Data {
   *   @field({upper: true}) name: string;
   * }
   *
   * Kernel.create().get(Json).sanitize(Data, {name: "Jean"});
   * ```
   *
   * @param type    Class definition
   * @param data    Json data
   * @return        Sanitized data
   */
  public sanitize<T extends object>(type: Class<T>, data: T): T {
    return this.sanitizer.sanitizeClass(type, data);
  }

  /**
   * Json#parse(), Json#validate(), Json#map() and Json#sanitize().
   *
   * ```ts
   * class Data {
   *   @field name: string;
   * }
   *
   * Kernel.create().get(Json).build(Data, {name: "Jean"});
   * ```
   *
   * @param type    Class definition
   * @param data    Raw data (string or object)
   */
  public build<T extends object>(type: Class<T>, data: string | object): T {
    return this.sanitize(type, this.map(type, this.validate(type, this.parse(data))));
  }

  /**
   * Extract JsonSchemaReader from a class.
   *
   * ```ts
   * class Data {
   *   @field name: string;
   * }
   *
   * Kernel.create().get(Json).schema(Data); // {properties: { ...
   * ```
   *
   * @param type    Definition
   * @return        JsonSchema
   */
  public schema<T extends object>(type: Class<T>): IJsonSchema {
    return this.schemaReader.extractSchema(type);
  }
}
