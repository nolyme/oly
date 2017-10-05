import { createQueue, Queue } from "kue";
import { env, IDeclarations, inject, Logger, Meta, state } from "oly";
import { olyQueueKeys } from "../";
import { ITask } from "../interfaces";

/**
 * Queue.
 */
export class QueueProvider {

  @env("OLY_QUEUE_REDIS_URL")
  public readonly connectionUrl: string = "redis://localhost:6379";

  @env("OLY_QUEUE_SHUTDOWN_TIMEOUT")
  public readonly shutdownTimeout: number = 5000;

  @state
  public queue: Queue;

  @state
  public tasks: ITask[];

  @inject
  protected logger: Logger;

  /**
   * Hook.
   */
  public onStart(declarations: IDeclarations) {

    this.tasks = [];
    this.queue = this.createQueue();

    for (const declaration of declarations) {
      const meta = Meta.of({key: olyQueueKeys.tasks, target: declaration.definition}).deep();
      if (meta) {
        const keys = Object.keys(meta.properties);
        for (const key of keys) {
          this.tasks.push({propertyKey: key, target: declaration.definition, options: meta.properties[key]});
        }
      }
    }

    return new Promise((resolve) => {
      this.logger.info(`connected to ${this.connectionUrl}`);
      resolve();
    });
  }

  /**
   * Hook.
   */
  public onStop() {
    this.logger.info(`close ${this.connectionUrl}`);
    return new Promise((resolve, reject) => {
      this.queue.shutdown(this.shutdownTimeout, (err: Error) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }

  /**
   * @overridable
   */
  protected createQueue() {
    const queue = createQueue({redis: this.connectionUrl});
    queue.watchStuckJobs(10000);
    return queue;
  }
}
