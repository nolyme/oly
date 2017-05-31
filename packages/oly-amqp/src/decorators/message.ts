import { IDecorator, Kernel, Meta, olyCoreKeys } from "oly-core";

export class TaskMessageDecorator implements IDecorator {

  public asParameter(target: object, propertyKey: string, index: number): void {
    Meta.of({key: olyCoreKeys.arguments, target, propertyKey, index}).set({
      handler: (kernel: Kernel) => kernel.state("Amqp.message"),
    });
  }
}

export const message = Meta.decoratorWithoutOptions(TaskMessageDecorator);
