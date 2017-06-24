import { inject, Kernel, Logger, state } from "oly-core";
import { HttpServerProvider } from "oly-http";
import * as io from "socket.io";
import { ISocket, ISocketServer } from "../interfaces";

export class SocketServerProvider {

  public static readonly io = io;

  @state
  public sockets: ISocket[] = [];

  @state
  public server: ISocketServer;

  @inject
  protected kernel: Kernel;

  @inject
  protected logger: Logger;

  @inject
  protected httpServerProvider: HttpServerProvider;

  public onStart() {
    this.sockets = [];
    this.server = SocketServerProvider.io.listen(this.httpServerProvider["http"]);
    this.server.on("connection", (socket: ISocket) => {
      this.handleConnection(socket);
    });
  }

  public onStop(): Promise<void> {
    this.sockets = [];
    return new Promise<void>((resolve) => this.server.close(resolve));
  }

  protected handleConnection(socket: ISocket) {
    socket.kernel = this.kernel.fork();

    for (const e of this.kernel["events"]) {
      if (typeof e.action !== "function") {
        socket.kernel["events"].push({
          ...e,
          action: {
            target: e.action.target,
            propertyKey: e.action.propertyKey,
          },
        });
      }
    }

    socket.kernel.state("socket", socket);

    const logger = socket.kernel.inject(Logger).as("SocketConnection");
    logger.debug(`create new connection`);

    socket.kernel.emit("connect");

    socket.on("oly:message", ({event, data}: any) => {
      logger.trace(`receive message ${event}`, {data});
      socket.kernel.emit(event, data);
    });

    socket.on("disconnect", () => {
      const i = this.sockets.indexOf(socket);
      if (i > -1) {
        this.sockets.slice(i, 1);
      }
      logger.debug("disconnect");
      socket.kernel.emit("disconnect");
    });

    this.sockets.push(socket);
  }
}
