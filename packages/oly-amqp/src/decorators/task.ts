import { Options } from "amqplib";
import { _, IDecorator, Meta } from "oly-core";
import { olyAmqpKeys } from "../constants/keys";

export interface ITaskOptions {
  assert?: Options.AssertQueue;
  consume?: Options.Consume;
  name?: string;
}

export class TaskDecorator implements IDecorator {

  private options: ITaskOptions;

  public constructor(options: ITaskOptions | string = {}) {
    if (typeof options === "string") {
      this.options = {name: options};
    } else if (typeof options === "object") {
      this.options = options;
    }
  }

  public asMethod(target: object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>): void {
    Meta.of({key: olyAmqpKeys.tasks, target, propertyKey}).set({
      name: this.options.name || _.identity(target, propertyKey),
      consume: this.options.consume || {},
      asserts: this.options.assert || {},
    });
  }
}

export const task = Meta.decorator(TaskDecorator);
