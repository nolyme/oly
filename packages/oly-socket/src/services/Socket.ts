import { inject, Logger, state } from "oly";
import { ISocket } from "../interfaces";

export class Socket {

  @state("socket")
  public socket: ISocket;

  @inject
  protected logger: Logger;

  public send(event: string, data: object | string = {}) {
    this.logger.trace(`send new message ${event}`, {data});
    this.socket.emit("oly:message", {
      event,
      data,
    });
  }
}
