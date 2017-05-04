import { IndexOptions } from "mongodb";
import { MetadataUtil } from "oly-core";

/**
 * Metadata name
 * Mongodb Indexes
 */
export const lyIndexes = "ly:indexes";

/**
 * Decorate a property with index options.
 *
 * @param options   Mongodb createIndex options
 */
export const index = (options: IndexOptions = {}) => (target: object, propertyKey: string) => {

  const indexes = MetadataUtil.get(lyIndexes, target.constructor);

  indexes[propertyKey] = {options};

  MetadataUtil.set(lyIndexes, indexes, target.constructor);
};
