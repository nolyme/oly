import { MetadataUtil } from "oly-core";
import { arg } from "oly-router";

/**
 * Annotate parameter as header with a name.
 *
 * ```typescript
 * class A {
 *    @get('/')
 *    action(@header('key') key: string) {
 *    }
 * }
 * ```
 */
export const header = (name?: string): ParameterDecorator => {
  return (target: object, propertyKey: string, parameterIndex: number): void => {

    if (!name) {
      name = MetadataUtil.getParamNames(target[propertyKey])[parameterIndex];
    }

    return arg({
      header: name,
      type: MetadataUtil.getPropParamTypes(target, propertyKey)[parameterIndex],
    })(target, propertyKey, parameterIndex);
  };
};
