import { Class, IDecorator, Kernel, Meta, olyCoreKeys } from "oly-core";
import { IFieldsMetadata } from "../";
import { olyMapperKeys } from "../constants/keys";
import { Json } from "../services/Json";

export class BuildDecorator implements IDecorator {

  public asParameter(target: object, propertyKey: string, index: number): void {

    const meta = Meta.of({key: olyCoreKeys.arguments, target, propertyKey, index});
    const data = meta.get();
    const handler: any = (data && data.args[propertyKey]) ? data.args[propertyKey][index].handler : null;

    meta.set({
      type: Meta.designParamTypes(target, propertyKey)[index] as any,
      handler: (k: Kernel, args: any[]) => {
        const json = k.inject(Json);
        const type = Meta.designParamTypes(target, propertyKey)[index];
        const value = handler ? handler(k, args) : args[0];

        const fieldsMetadata = Meta.of({key: olyMapperKeys.fields, target: type}).get<IFieldsMetadata>();
        if (!fieldsMetadata) {
          return value;
        }

        return json.build(type as Class, value);
      },
    });
  }
}

/**
 *
 */
export const build = Meta.decoratorWithoutOptions(BuildDecorator);
