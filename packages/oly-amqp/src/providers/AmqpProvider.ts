import { Channel, connect, Connection, Options, Replies } from "amqplib";
import { env, inject, IProvider, Kernel, Logger, state } from "oly-core";
import { MemoryQueue } from "../services/MemoryQueue";

export class AmqpProvider implements IProvider {

  /**
   *
   */
  @env("AMQP_URL")
  public readonly url: string = ":memory:";

  @state
  public connection: Connection;

  @state
  public channel: Channel;

  @inject
  protected readonly kernel: Kernel;

  @inject
  protected readonly logger: Logger;

  /**
   *
   */
  public async onStart() {
    this.logger.info(`connect to ${this.url}`);
    if (this.url === ":memory:") {
      this.channel = new MemoryQueue();
    } else {
      this.connection = await connect(this.url);
      this.channel = await this.connection.createChannel();
    }
  }

  /**
   *
   */
  public async onStop() {
    this.logger.info(`close connection`);
    if (this.url !== ":memory:") {
      await this.channel.close();
      await this.connection.close();
    }
  }
}
