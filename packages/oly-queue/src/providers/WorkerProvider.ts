import { Job, ProcessCallback, Queue } from "kue";
import { IDeclarations, inject, Kernel, Logger } from "oly";
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
      this.queueProvider.queue.process(
        task.options.name,
        task.options.concurrency,
        this.processJob(task));
    }
  }

  /**
   * @overridable
   */
  protected processJob(task: ITask): ProcessCallback {
    return async (job: Job, done: Function) => {

      const child = this.kernel.fork();
      const logger = child.get(Logger).as("Queue");

      try {
        logger.info(`begin ${task.options.name}`);
        const response = await child.invoke(task.target, task.propertyKey, [job.data, job]);
        logger.info(`${task.options.name} OK`);
        done(null, response);
      } catch (e) {
        logger.warn(`${task.options.name} has failed`, e);
        done(e);
      }
    };
  }
}
