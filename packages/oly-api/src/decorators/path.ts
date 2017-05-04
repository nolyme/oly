import { MetadataUtil } from "oly-core";
import { arg } from "./arg";

/**
 * Annotate parameter as path variable with a name.
 *
 * ```typescript
 * class A {
 *    @get('/:id')
 *    action(@path('id') id: string) {
 *    }
 * }
 * ```
 *
 */
export const path = (name?: string): ParameterDecorator => {
  return (target: object, propertyKey: string, parameterIndex: number): void => {
    if (!name) {
      name = MetadataUtil.getParamNames(target[propertyKey])[parameterIndex];
    }
    return arg({path: name})(target, propertyKey, parameterIndex);
  };
};
