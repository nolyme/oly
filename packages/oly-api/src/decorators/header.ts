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
export const header = (options: string | { name?: string; required?: boolean } = {}): ParameterDecorator => {
  return (target: object, propertyKey: string, parameterIndex: number): void => {

    const meta = typeof options === "string"
      ? {name: options}
      : options;

    if (!meta.name) {
      meta.name = MetadataUtil.getParamNames(target[propertyKey])[parameterIndex];
    }

    return arg({
      header: meta.name,
      required: meta.required,
      type: MetadataUtil.getPropParamTypes(target, propertyKey)[parameterIndex],
    })(target, propertyKey, parameterIndex);
  };
};
