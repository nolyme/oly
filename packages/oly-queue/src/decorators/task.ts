import { MetadataUtil } from "oly-core";
import { lyTasks } from "../constants";
import { ITaskOptions, ITasks } from "../interfaces";

/**
 * Attach a Job to a propertyKey.
 * Result can be used by KueProvider (Publisher) or WorkerProvider (Subscriber).
 */
export const task = (options: Partial<ITaskOptions> = {}) => (target: object, propertyKey: string) => {

  const tasks: ITasks = MetadataUtil.get(lyTasks, target.constructor);

  tasks[propertyKey] = {
    options: {
      assert: options.assert || {},
      concurrency: options.concurrency || 10,
      consume: options.consume || {},
      name: options.name || propertyKey,
      priority: options.priority || 0,
      retry: options.retry || 0,
    },
    propertyKey,
    target: (target.constructor as any),
  };

  MetadataUtil.set(lyTasks, tasks, target.constructor);
};
