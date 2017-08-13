import { Channel, connect, Connection } from "amqplib";
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
