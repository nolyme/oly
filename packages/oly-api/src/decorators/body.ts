import { IClass, MetadataUtil } from "oly-core";
import { arg } from "oly-router";

/**
 * Annotate parameter as request body with a class definition.
 * Class needs to be annotated with oly-mapper.
 *
 * ```typescript
 * class Data {
 *    @field name: string;
 * }
 * class A {
 *    @post('/') create(@body() body: Data) {
 *    }
 *    // or
 *    @post('/2') create2(@body() body) {
 *    }
 * }
 */
export const body = (type?: IClass): ParameterDecorator => {
  return (target: object, propertyKey: string, parameterIndex: number): void => {
    return arg({
      body: type || MetadataUtil.getPropParamTypes(target, propertyKey)[parameterIndex],
    })(target, propertyKey, parameterIndex);
  };
};
