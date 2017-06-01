import { IndexOptions, ObjectID } from "mongodb";
import { IMetadata } from "oly-core";

/**
 *
 */
export { ObjectID, Binary } from "mongodb";

/**
 * Object Id.
 */
export type ID = string | ObjectID;

/**
 * Minimal document requirement.
 */
export interface IDocument {
  _id?: string;
}

/**
 *
 */
export type IIndexProperty = IndexOptions;

/**
 *
 */
export interface IIndexesMetadata extends IMetadata {
  properties: {
    [key: string]: IIndexProperty;
  };
}
