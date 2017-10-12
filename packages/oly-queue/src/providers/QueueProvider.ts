import * as Bull from "bull";
import { env, IDeclarations, inject, Logger, Meta, state } from "oly";
import { olyQueueKeys } from "../";
import { ITask, ITaskMetadata } from "../interfaces";

/**
 * Queue.
 */
export class QueueProvider {

  @env("OLY_QUEUE_REDIS_URL")
  public readonly connectionUrl: string = "redis://localhost:6379";

  @env("OLY_QUEUE_REDIS_PREFIX")
  public readonly prefix: string = "oly";

  @state
  public tasks: ITask[];

  @inject
  protected logger: Logger;

  /**
   * Hook.
   */
  public async onStart(declarations: IDeclarations) {

    this.tasks = [];
    for (const declaration of declarations) {

      const meta = Meta.of({key: olyQueueKeys.tasks, target: declaration.definition}).deep<ITaskMetadata>();
      if (meta) {

        const keys = Object.keys(meta.properties);
        for (const key of keys) {
          this.tasks.push({
            queue: this.createQueue(meta.properties[key].name, this.connectionUrl),
            propertyKey: key,
            target: declaration.definition,
            options: meta.properties[key],
          });
        }
      }
    }

    for (const task of this.tasks) {
      await task.queue.getJobCounts();
    }
  }

  /**
   * Hook.
   */
  public async onStop() {
    this.logger.info(`close ${this.connectionUrl}`);
    for (const task of this.tasks) {
      await task.queue.close();
    }
  }

  /**
   * @overridable
   */
  protected createQueue(name: string, url: string) {
    return new Bull(name, url);
  }
}
