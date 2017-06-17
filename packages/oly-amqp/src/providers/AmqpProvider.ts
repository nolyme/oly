import { Channel, connect, Connection, Options, Replies } from "amqplib";
import { env, inject, IProvider, Kernel, Logger, state } from "oly-core";

export class AmqpProvider implements IProvider {

  /**
   *
   */
  @env("AMQP_URL")
  public readonly url: string = "amqp://localhost";

  @state
  public connection: Connection;

  @state
  public channel: Channel;

  @inject
  protected readonly kernel: Kernel;

  @inject
  protected readonly logger: Logger;

  /**
   * Push message into a queue.
   * Queue isn't asserted.
   *
   * @param queue       Queue name
   * @param payload     Custom data
   * @param options     Amqp publish options
   */
  public publish(queue: string, payload: string = "", options: Options.Publish = {}): boolean {

    this.logger.debug(`publish into ${queue}`);

    options.correlationId = this.kernel.id;

    return this.channel.sendToQueue(queue, new Buffer(payload), options);
  }

  /**
   * Purge a queue.
   *
   * @param taskName    Task name (= queue name)
   */
  public async purge(taskName: string): Promise<Replies.PurgeQueue> {
    return await this.channel.purgeQueue(taskName);
  }

  /**
   *
   */
  public async onStart() {
    this.logger.info(`connect to ${this.url}`);
    this.connection = await connect(this.url);
    this.channel = await this.connection.createChannel();
  }

  /**
   *
   */
  public async onStop() {
    this.logger.info(`close connection`);
    await this.channel.close();
    await this.connection.close();
  }
}
