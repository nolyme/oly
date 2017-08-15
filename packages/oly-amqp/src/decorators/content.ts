import { IDecorator, Kernel, Meta, olyCoreKeys, TypeParser } from "oly-core";
import { build, olyMapperKeys } from "oly-json";
import { IMessage } from "../interfaces";

export class ContentDecorator implements IDecorator {

  public asParameter(target: object, propertyKey: string, index: number): void {

    const type = Meta.designParamTypes(target, propertyKey)[index];

    Meta.of({key: olyCoreKeys.arguments, target, propertyKey, index}).set({
      handler: (k: Kernel) => {
        const message: IMessage = k.state("Amqp.message");
        if (message) {
          return TypeParser.parse(type, message.content.toString("UTF-8"));
        }
      },
    });

    // auto @build with @body, remove this line if feature is useless
    if (Meta.of({key: olyMapperKeys.fields, target: type})) {
      build(target, propertyKey, index);
    }
  }
}

/**
 *
 */
export const content = Meta.decoratorWithoutOptions(ContentDecorator);
