import { env, inject, Kernel, Logger, state } from "oly";
import * as io from "socket.io-client";
import { ISocketClient } from "../interfaces";

export class SocketClientProvider {

  public static readonly io = io;

  @state("socket")
  protected socket: ISocketClient;

  @inject
  protected kernel: Kernel;

  @inject
  protected logger: Logger;

  /**
   * Will use SocketClientProvider#connect() in #onStart.
   */
  @env("SOCKET_AUTO_CONNECT")
  protected readonly auto: boolean = false;

  @env("SOCKET_REMOTE_URL")
  protected readonly url: string = "";

  public async connect(): Promise<void> {
    if (!this.socket || !this.socket.connected) {
      this.socket = SocketClientProvider.io.connect(this.url) as any;
      this.socket.kernel = this.kernel;
      this.logger.info(`connect to '${this.url}'`);
      await new Promise<void>((resolve, reject) => {
        this.socket.once("connect", () => resolve());
        this.socket.once("error", reject);
      });
      this.socket.on("oly:message", ({data, event}: any) => {
        this.logger.trace(`receive message ${event}`, {data});
        this.kernel.emit(event, data);
      });
      this.kernel.state("socket", this.socket);
    }
  }

  public async close() {
    if (this.socket.connected) {
      this.socket.close();
    }
  }

  public async onStart() {
    if (this.auto) {
      await this.connect();
    }
  }

  public async onStop() {
    if (this.auto) {
      await this.close();
    }
  }
}
