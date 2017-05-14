import { MetadataUtil } from "oly-core";
import { arg } from "oly-router";

/**
 * Annotate parameter as request query with a name.
 *
 * ```typescript
 * class A {
 *    @get('/')
 *    action(@query('key') key: string) {
 *    }
 * }
 * ```
 */
export const query =
  (name?: string): ParameterDecorator =>
    (target: object, propertyKey: string, parameterIndex: number): void => {

      if (!name) {
        name = MetadataUtil.getParamNames(target[propertyKey])[parameterIndex];
      }

      return arg({
        query: name,
        type: MetadataUtil.getPropParamTypes(target, propertyKey)[parameterIndex],
      })(target, propertyKey, parameterIndex);
    };
