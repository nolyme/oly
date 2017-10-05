import { IDecorator, Meta } from "oly";
import { olyQueueKeys } from "../constants/keys";
import { ITaskProperty } from "../interfaces";

export class TaskDecorator implements IDecorator {
  public constructor(private options: Partial<ITaskProperty> = {}) {
  }

  public asMethod(target: Object, propertyKey: string) {
    Meta.of({key: olyQueueKeys.tasks, target, propertyKey}).set({
      ...this.options,
      name: this.options.name || `${target.constructor.name}.${propertyKey}`,
      priority: this.options.priority || "normal",
      unique: !!this.options.unique,
      delay: this.options.delay || 0,
      concurrency: this.options.concurrency || 1,
    });
  }
}

/**
 * Task.
 */
export const task = Meta.decorator<Partial<ITaskProperty>>(TaskDecorator);
