import { MetadataUtil } from "oly-core";
import { lyTasks } from "../constants";
import { ITaskOptions, ITasks } from "../interfaces";

/**
 * Attach a Job to a propertyKey.
 * Result can be used by KueProvider (Publisher) or WorkerProvider (Subscriber).
 */
export const task = (options?: Partial<ITaskOptions> | string) => (target: object, propertyKey: string) => {

  const tasks: ITasks = MetadataUtil.get(lyTasks, target.constructor);

  tasks[propertyKey] = {
    options: typeof options === "object" ? {
      assert: options.assert || {},
      consume: options.consume || {},
      name: options.name || propertyKey,
    } : {
      assert: {},
      consume: {},
      name: options || propertyKey,
    },
    propertyKey,
    target: (target.constructor as any),
  };

  MetadataUtil.set(lyTasks, tasks, target.constructor);
};
