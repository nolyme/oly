import { Message, Options } from "amqplib";
import { _, IDeclarations, inject, Kernel, Logger, MetadataUtil } from "oly-core";
import { lyTasks } from "../constants";
import { ITask } from "../interfaces";
import { AmqpProvider } from "./AmqpProvider";

export class WorkerProvider {

  @inject(AmqpProvider)
  protected amqp: AmqpProvider;

  @inject(Kernel)
  protected readonly kernel: Kernel;

  @inject(Logger)
  protected readonly logger: Logger;

  public async consume(task: ITask, options: Options.Consume = {}) {
    await this.amqp.channel.assertQueue(task.options.name, task.options.assert);
    await this.amqp.channel.consume(task.options.name, this.createHandler(task),
      _.assign({}, task.options.consume, options));
  }

  public async scan(declarations: IDeclarations) {
    for (const dep of declarations) {
      if (MetadataUtil.has(lyTasks, dep.definition)) {
        const tasks = MetadataUtil.deep(lyTasks, dep.definition);
        for (const propertyKey of Object.keys(tasks)) {
          const task: ITask = tasks[propertyKey];
          this.logger.debug(`consume ${task.options.name} -> ${task.target.name}#${task.propertyKey}()`);
          await this.consume(task, {noAck: false});
        }
      }
    }
  }

  protected async onStart(declarations: IDeclarations) {
    await this.scan(declarations);
  }

  protected createHandler(task: ITask) {
    return async (message: Message) => {
      const kernel = this.kernel.fork();
      const logger = kernel.get(Logger).as("ConsumerProvider");
      try {
        logger.info(`begin task "${task.options.name}:${message.properties.correlationId}"`);
        const instance = kernel.get(task.target);
        const action = instance[task.propertyKey];
        await action.apply(instance, [message]);
        logger.info(`end task successfully`);
        this.amqp.channel.ack(message);
      } catch (e) {
        logger.warn("task has failed", e);
        this.amqp.channel.ack(message);
      }
    };
  }
}
