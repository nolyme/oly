import { Channel, connect, Connection } from "amqplib";
import { env, inject, IProvider, Kernel, Logger, state } from "../../../oly/lib/index";

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
    this.connection = await connect(this.url);
    this.channel = await this.connection.createChannel();
    this.logger.info(`connected to ${this.url}`);
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
