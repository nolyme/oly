import { IClass } from "oly-core";

/**
 *
 */
export type FieldType = "object" | "array" | "string" | "number" | "boolean" | "any";

/**
 *
 */
export type FieldFormat = "date" | "time" | "date-time" | "uri" | "email" | "hostname" | "ipv4" | "uuid";

/**
 *
 */
export interface IField {
  of?: IClass | null;
  name?: string;
  required?: boolean;
  type?: FieldType;
  description?: string;
  enum?: any[];
  default?: any;
  // NUMBER
  minimum?: number;
  maximum?: number;
  exclusiveMaximum?: boolean;
  exclusiveMinimum?: boolean;
  // STRING
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  format?: FieldFormat;
  /**
   * Sanitize
   */
  trim?: boolean;
  upper?: boolean;
  lower?: boolean;
}

/**
 *
 */
export interface IArrayField extends IField {
  of: IClass | null;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
}

/**
 *
 */
export type PrimitiveType = number | boolean | string | null;

/**
 *
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
  additionalProperties?: IJsonSchema;
  required?: string[];
  propertyOrder?: string[];
  properties?: { [key: string]: IJsonSchema };
  defaultProperties?: string[];
  typeof?: "function";
}
