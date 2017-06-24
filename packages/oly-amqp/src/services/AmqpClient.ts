import { Options, Replies } from "amqplib";
import { inject, Kernel, Logger } from "oly-core";
import { AmqpProvider } from "../providers/AmqpProvider";

export class AmqpClient {

  @inject
  protected readonly logger: Logger;

  @inject
  protected readonly kernel: Kernel;

  @inject
  protected readonly amqpProvider: AmqpProvider;

  /**
   * Push message into a queue.
   * Queue isn't asserted.
   *
   * @param queue       Queue name
   * @param payload     Custom data
   * @param options     AmqpClient publish options
   */
  public publish(queue: string, payload: string = "", options: Options.Publish = {}): boolean {

    this.logger.debug(`publish into ${queue}`);

    options.correlationId = this.kernel.id;

    return this.amqpProvider.channel.sendToQueue(queue, new Buffer(payload), options);
  }

  /**
   * Purge a queue.
   *
   * @param taskName    Task name (= queue name)
   */
  public async purge(taskName: string): Promise<Replies.PurgeQueue> {
    return await this.amqpProvider.channel.purgeQueue(taskName);
  }
}
