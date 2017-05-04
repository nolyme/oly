import { designType, lyDependencies } from "../constants/keys";
import { IDependencyMetadataMap } from "../interfaces/relations";
import { IClass } from "../interfaces/types";
import { MetadataUtil } from "../utils/MetadataUtil";

/**
 * Inject a dependency.
 *
 * ```typescript
 * class B {}
 * class A {
 *  @inject a: B;
 * }
 * // or
 * class A {
 *  @inject(B) a: B;
 * }
 * ```
 *
 * @param type            Optional definition to use
 * @param propertyKey     ~
 */
export const inject = (type?: IClass | object, propertyKey?: string): any => {
  if (!!propertyKey && typeof type === "object") {
    return $inject()(type, propertyKey);
  }
  return $inject(type as IClass);
};

/**
 * @internal
 */
const $inject = (type?: IClass): PropertyDecorator => (target: object, propertyKey: string): void => {
  const injections: IDependencyMetadataMap = MetadataUtil.get(lyDependencies, target.constructor);

  injections[propertyKey] = {
    type: type || MetadataUtil.getProp(designType, target, propertyKey),
  };

  MetadataUtil.set(lyDependencies, injections, target.constructor);
};
