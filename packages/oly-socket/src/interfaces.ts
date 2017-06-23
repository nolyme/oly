import { Kernel } from "oly-core";

export interface ISocket extends SocketIO.Socket {
  kernel: Kernel;
}

export interface ISocketServer extends SocketIO.Server {
}
