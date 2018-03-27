import { Message } from "amqplib";
import { Class, IDeclarations, inject, IProvider, Kernel, Logger, Meta } from "oly";
import { olyAmqpKeys } from "../constants/keys";
import { ITasksMetadata } from "../interfaces";
import { AmqpProvider } from "./AmqpProvider";

export class WorkerProvider implements IProvider {

  @inject
  protected readonly amqp: AmqpProvider;

  @inject
  protected readonly kernel: Kernel;

  @inject
  protected readonly logger: Logger;

  /**
   *
   * @param declarations
   */
  public async scan(declarations: IDeclarations) {
    for (const {definition: target} of declarations) {
      const meta = Meta.of({key: olyAmqpKeys.tasks, target});
      const tasksMetadata = meta.get<ITasksMetadata>();
      if (tasksMetadata) {
        const keys = Object.keys(tasksMetadata.properties);

        for (const propertyKey of keys) {
          const task = tasksMetadata.properties[propertyKey];

          this.logger.debug(`${task.name} -> ${target.name}#${propertyKey}()`);
          await this.amqp.channel.assertQueue(task.name, task.assert);
          await this.amqp.channel.prefetch(4);
          await this.amqp.channel.consume(task.name,
            this.createHandler(target, propertyKey, task.name), task.consume);
        }
      }
    }
  }

  /**
   *
   * @param declarations
   */
  public async onStart(declarations: IDeclarations) {
    await this.scan(declarations);
  }

  /**
   *
   * @param target
   * @param propertyKey
   * @param name
   */
  protected createHandler(target: Class<any>, propertyKey: string, name: string) {
    return async (message: Message | null) => {
      const kernel = this.kernel.fork();
      if (message != null) {
        kernel.state("Amqp.message", message);
        const logger = kernel.inject(Logger).as("Worker");
        try {
          logger.info(`begin ${name}`);
          await kernel.invoke(target, propertyKey, [message]);
          logger.info(`${name} OK`);
          this.amqp.channel.ack(message);
        } catch (e) {
          logger.warn(`${name} has failed`, e);
          this.amqp.channel.ack(message);
        }
      }
    };
  }
}
