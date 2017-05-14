import { IAnyFunction } from "oly-core";

/**
 * @alias
 */
export type IType = IAnyFunction;

/**
 * Json schema list of type.
 */
export type FieldType = "object" | "array" | "string" | "number" | "boolean" | "null";

/**
 * Json Schema list of format.
 */
export type FieldFormat = "date" | "time" | "date-time" | "uri" | "email" | "hostname" | "ipv4" | "uuid";

/**
 * Abstract definition of a generic field.
 */
export interface IMetaBase {
  /**
   * Name of the field.
   * Used everywhere.
   */
  name?: string;
  /**
   * JsonSchema `description`
   */
  description?: string;
  /**
   * JsonSchema `required`
   */
  required?: boolean;
  /**
   * JsonSchema `default`
   */
  default?: any;
  /**
   * JsonSchema `exclusiveMinimum`
   */
  enum?: any[];
}

/**
 * Metadata about a array.
 */
export interface IMetaArray extends IMetaBase {
  /**
   * field inside the array
   * It's like JsonSchema `items`
   */
  of: IField | IType;
  /**
   * JsonSchema `minItems`
   */
  minItems?: number;
  /**
   * JsonSchema `maxItems`
   */
  maxItems?: number;
  /**
   * JsonSchema `uniqueItems`
   */
  uniqueItems?: boolean;
}

/**
 * Metadata about a string.
 */
export interface IMetaString extends IMetaBase {
  /**
   * JsonSchema `minLength`
   */
  minLength?: number;
  /**
   * JsonSchema `maxLength`
   */
  maxLength?: number;
  /**
   * JsonSchema `pattern`
   */
  pattern?: RegExp;
  /**
   * JsonSchema `format`
   */
  format?: FieldFormat;
  /**
   * Sanitizer
   * Enabled trim
   */
  trim?: boolean;
  /**
   * Sanitizer
   * Enabled uppercase
   */
  upper?: boolean;
  /**
   * Sanitizer
   * Enabled lowercase
   */
  lower?: boolean;
  /**
   * Sanitizer
   * Enabled normalize
   */
  normalize?: boolean | string;
}

/**
 * Metadata about a number.
 */
export interface IMetaNumber extends IMetaBase {
  /**
   * JsonSchema `minimum`
   */
  minimum?: number;
  /**
   * JsonSchema `maximum`
   */
  maximum?: number;
  /**
   * JsonSchema `exclusiveMaximum`
   */
  exclusiveMaximum?: boolean;
  /**
   * JsonSchema `exclusiveMinimum`
   */
  exclusiveMinimum?: boolean;
}

export interface IMetaObject extends IMetaBase {
  /**
   * Skip `type` for mapping and use only this function.
   * ```typescript
   * class A {
   *    @field({
   *      map: (dateAsString) => new Date(dateAsString)
   *    })
   *    date: Date;
   * }
   * ```
   */
  map?: (raw: any) => any;
}

/**
 * Metadata about a generic field.
 */
export interface IField extends Partial<IMetaArray>, IMetaNumber, IMetaString, IMetaObject {

  name: string; // a field has ALWAYS a name

  /**
   * Internal definition of a field.
   * This is used to find the JsonSchema `type` with FieldMetadataUtil#getFieldType().
   * This is also used for auto-mapping.
   */
  type: IType;
}

/**
 * Union of primitive type.
 */
export type PrimitiveType = number | boolean | string | null;

/**
 * Supported JsonSchema definition.
 */
export interface IJsonSchema {
  name?: string;
  $ref?: string;
  description?: string;
  allOf?: IJsonSchema[];
  oneOf?: IJsonSchema[];
  anyOf?: IJsonSchema[];
  title?: string;
  type?: string | string[];
  definitions?: {
    [key: string]: any;
  };
  format?: string;
  items?: IJsonSchema;
  minItems?: number;
  additionalItems?: {
    anyOf: IJsonSchema;
  };
  enum?: PrimitiveType[] | IJsonSchema[];
  default?: PrimitiveType | object;
  additionalProperties?: IJsonSchema | boolean;
  required?: string[];
  propertyOrder?: string[];
  properties?: { [key: string]: IJsonSchema };
  defaultProperties?: string[];
}
