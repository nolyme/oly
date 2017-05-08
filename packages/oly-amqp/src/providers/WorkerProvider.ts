import { Message, Options } from "amqplib";
import { _, env, IDeclarations, inject, Kernel, Logger, MetadataUtil, state } from "oly-core";
import { lyTasks } from "../constants";
import { ITask, ITaskData } from "../interfaces";
import { AmqpProvider } from "./AmqpProvider";

export class WorkerProvider {

  @env("OLY_QUEUE_RETRY_DELAY")
  public readonly retryDelay: number = 1000;

  @inject(AmqpProvider)
  protected amqp: AmqpProvider;

  @inject(Kernel)
  protected readonly kernel: Kernel;

  @inject(Logger)
  protected readonly logger: Logger;

  @state()
  protected workers: number = 0;

  public async consume(task: ITask, options: Options.Consume = {}) {

    if (task.options.priority) {
      options.priority = task.options.priority;
    }

    await this.amqp.channel.assertQueue(task.options.name, task.options.assert);
    await this.amqp.channel.consume(task.options.name, this.createHandler(task),
      _.assign({}, task.options.consume, options));
  }

  protected async onStart(deps: IDeclarations) {
    for (const dep of deps) {
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

  protected createHandler(task: ITask) {
    return async (message: Message) => {
      this.workers += 1;
      const kernel = this.kernel.fork();
      const logger = kernel.get(Logger).as("ConsumerProvider");
      const data = this.amqp.extract(message);
      try {
        logger.info(`begin task "${task.options.name}:${data.id}"`);
        const instance = kernel.get(task.target);
        const action = instance[task.propertyKey];
        await action.apply(instance, [data.payload, message]);
        logger.info(`end task successfully`);
        this.ack(message);
      } catch (e) {
        logger.warn("task has failed", e);
        if (task.options.retry && data.attempts < task.options.retry) {
          logger.debug(`retry task "${task.options.name}:${data.id}"`);
          await _.timeout(this.retryDelay * (data.attempts + 1));
          this.retry(message, task, data);
          this.ack(message);
        } else {
          this.ack(message);
        }
      }
    };
  }

  protected retry(message: Message, task: ITask, data: ITaskData): void {
    this.amqp.channel.sendToQueue(task.options.name, new Buffer(JSON.stringify({
      attempts: data.attempts + 1,
      id: data.id,
      payload: data.payload,
    })), message.properties);
  }

  protected ack(message: Message): void {
    this.workers -= 1;
    if (this.workers === 0) {
      this.sleep();
    }
    this.amqp.channel.ack(message);
  }

  protected sleep(): void {
    setTimeout(() => {
      if (this.workers === 0) {
        this.kernel.emit("oly:worker:sleep");
      }
    }, 1000);
  }
}
