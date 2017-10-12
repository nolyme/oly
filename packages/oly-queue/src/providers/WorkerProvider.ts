import * as Bull from "bull";
import { inject, Kernel, Logger } from "oly";
import { ITask } from "../interfaces";
import { QueueProvider } from "./QueueProvider";

/**
 * Worker.
 */
export class WorkerProvider {

  @inject
  protected kernel: Kernel;

  @inject
  protected queueProvider: QueueProvider;

  @inject
  protected logger: Logger;

  /**
   * Hook.
   */
  public async onStart() {
    for (const task of this.queueProvider.tasks) {
      this.logger.debug(
        `${task.options.name} -> ${task.target.name}#${task.propertyKey}() [${task.options.concurrency}]`);
      task.queue.process(task.options.concurrency || 1, this.createDoneCallback(task));
    }
  }

  /**
   * @overridable
   */
  public createDoneCallback(task: ITask) {
    const kernel = this.kernel;
    return async (job: Bull.Job) => {
      const child = kernel.fork();
      const logger = child.get(Logger).as("Worker");
      try {
        logger.info(`begin ${task.options.name}`);
        const response = await child.invoke(task.target, task.propertyKey, [job.data, job]);
        logger.info(`${task.options.name} OK`);
        return response;
      } catch (e) {
        logger.warn(`${task.options.name} has failed`, e);
        throw e;
      }
    };
  }
}
