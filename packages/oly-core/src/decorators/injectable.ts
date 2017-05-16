import { lyDefinition } from "../constants/keys";
import { IDefinitionMetadata } from "../interfaces/relations";
import { IClass } from "../interfaces/types";
import { MetadataUtil } from "../utils/MetadataUtil";

/**
 * Default injectable annotation.
 * This is completely optional.
 *
 * ```typescript
 * @injectable()
 * class A {
 * }
 * ```
 *
 * @param options     {@see IDefinitionMetadata}
 */
export const injectable = <T>(options: IDefinitionMetadata<T> = {}) => (target: IClass): any => {

  MetadataUtil.set(lyDefinition, options, target);

  return target;
};
