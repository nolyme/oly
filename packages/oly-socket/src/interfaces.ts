import { Kernel } from "oly";

export interface ISocket extends SocketIO.Socket {
  kernel: Kernel;
}

export interface ISocketClient extends SocketIOClient.Socket {
  kernel: Kernel;
}

export interface ISocketServer extends SocketIO.Server {
}
