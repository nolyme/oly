import { Message } from "amqplib";
import { IClass, IDeclarations, inject, Kernel, Logger, Meta } from "oly-core";
import { olyAmqpKeys } from "../constants/keys";
import { ITasksMetadata } from "../interfaces";
import { AmqpProvider } from "./AmqpProvider";

export class WorkerProvider {

  @inject(AmqpProvider)
  protected amqp: AmqpProvider;

  @inject(Kernel)
  protected readonly kernel: Kernel;

  @inject(Logger)
  protected readonly logger: Logger;

  public async scan(declarations: IDeclarations) {
    for (const {definition: target} of declarations) {
      const meta = Meta.of({key: olyAmqpKeys.tasks, target});
      const tasksMetadata = meta.get<ITasksMetadata>();
      if (tasksMetadata) {
        const keys = Object.keys(tasksMetadata.properties);

        for (const propertyKey of keys) {
          const task = tasksMetadata.properties[propertyKey];

          this.logger.debug(`consume ${task.name} -> ${target.name}#${propertyKey}()`);
          await this.amqp.channel.assertQueue(task.name, task.assert);
          await this.amqp.channel.consume(task.name, this.createHandler(target, propertyKey, task.name),
            Object.assign({}, task.consume));
        }
      }
    }
  }

  protected async onStart(declarations: IDeclarations) {
    await this.scan(declarations);
  }

  protected createHandler(target: IClass, propertyKey: string, name: string) {
    return async (message: Message) => {
      const kernel = this.kernel.fork();
      kernel.state("Amqp.message", message);
      const logger = kernel.get(Logger).as("ConsumerProvider");
      try {
        logger.info(`begin task "${name}:${message.properties.correlationId}"`);
        await kernel.invoke(target, propertyKey);
        logger.info(`end task successfully`);
        this.amqp.channel.ack(message);
      } catch (e) {
        logger.warn("task has failed", e);
        this.amqp.channel.ack(message);
      }
    };
  }
}
