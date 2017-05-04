import { ObjectID } from "mongodb";

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
