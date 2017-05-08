import { Channel, connect, Connection, Message, Options, Replies } from "amqplib";
import { env, inject, Kernel, Logger, state } from "oly-core";
import { ITaskData } from "../interfaces";
import PurgeQueue = Replies.PurgeQueue;

/**
 *
 */
export class AmqpProvider {

  @env("OLY_QUEUE_CONCURRENCY")
  public readonly concurrency: number = 1;

  @env("OLY_QUEUE_URL")
  public readonly url: string = "amqp://localhost";

  @state()
  public connection: Connection;

  @state()
  public channel: Channel;

  @inject(Kernel)
  protected readonly kernel: Kernel;

  @inject(Logger)
  protected readonly logger: Logger;

  /**
   * Push message into a queue.
   * Queue isn't asserted.
   *
   * @param queue       Queue name
   * @param payload     Custom data
   * @param options     Amqp publish options
   */
  public publish(queue: string, payload: object = {}, options: Options.Publish = {}): boolean {
    this.logger.debug(`publish into ${queue}`, payload);
    return this.channel.sendToQueue(queue, new Buffer(JSON.stringify({
      attempts: 0,
      id: this.kernel.id,
      payload,
    })), options);
  }

  /**
   * Parse message content.
   *
   * @param message  Amqp message
   */
  public extract(message: Message): ITaskData {
    return JSON.parse(message.content.toString());
  }

  /**
   * Purge a queue.
   *
   * @param taskName    Task name (= queue name)
   */
  public purge(taskName: string): Promise<PurgeQueue> {
    return this.channel.purgeQueue(taskName);
  }

  protected async onStart() {
    this.logger.info(`connect to ${this.url}`);
    this.connection = await connect(this.url);
    this.channel = await this.connection.createChannel();
    await this.channel.prefetch(this.concurrency);
  }

  protected async onStop() {
    this.logger.info(`close connection`);
    await this.channel.close();
    await this.connection.close();
  }
}
