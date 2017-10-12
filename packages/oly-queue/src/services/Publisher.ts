import * as Bull from "bull";
import { Exception, inject, Kernel, Logger } from "oly";
import { olyQueueErrors } from "../constants/errors";
import { IJob, IQueue } from "../interfaces";
import { QueueProvider } from "../providers/QueueProvider";

export class Publisher {

  @inject
  protected kernel: Kernel;

  @inject
  protected logger: Logger;

  @inject
  protected queueProvider: QueueProvider;

  /**
   * Create a new task.
   */
  public async push(taskName: string,
                    data: object | number | string = {},
                    options: Bull.JobOptions = {}): Promise<IJob> {

    this.logger.trace(`push ${taskName}`, {data});

    // create job
    const task = this.queueProvider.tasks.find((t) => t.options.name === taskName);
    if (!task) {
      throw new Exception(olyQueueErrors.taskDoesNotExist(taskName));
    }

    return await task.queue.add(data, {
      ...task.options as any,
      ...options,
    });
  }

  public queue(taskName: string): IQueue | undefined {
    const task = this.queueProvider.tasks.find((t) => t.options.name === taskName);
    if (task) {
      return task.queue;
    }
  }

  public wait(job: IJob) {
    return job.finished();
  }

  /**
   *
   * @returns {Promise<void>}
   */
  public async purge(): Promise<void> {

    for (const task of this.queueProvider.tasks) {
      await task.queue.clean(1, "active");
      await task.queue.clean(1, "failed");
      await task.queue.empty();
    }
  }
}
