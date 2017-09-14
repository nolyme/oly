import { inject, Kernel, on } from "oly";
import { HttpServerProvider } from "oly-http";
import { SocketClientProvider } from "../src/providers/SocketClientProvider";
import { SocketServerProvider } from "../src/providers/SocketServerProvider";
import { Socket } from "../src";

describe("Socket", () => {

  class MyService {
    static stack = 0;

    @on("notification")
    onNotification() {
      MyService.stack += 1;
    }
  }

  class MyServerService {
    static stack = 0;

    @inject
    kernel: Kernel;

    @on("something")
    onSomething() {
      MyServerService.stack += 1;
    }
  }

  const kernelServer = Kernel.create({
    HTTP_SERVER_PORT: 4039,
  }).with(SocketServerProvider, MyServerService);

  const kernelClient = Kernel.create({
    SOCKET_REMOTE_URL: kernelServer.inject(HttpServerProvider).hostname,
    SOCKET_AUTO_CONNECT: true,
  }).with(SocketClientProvider, MyService);

  it("should be ok", async () => {

    const server: SocketServerProvider = kernelServer.get(SocketServerProvider);
    expect(server.sockets.length).toBe(1);

    const client = kernelClient.inject(Socket);
    process.nextTick(() => client.send("/", "Hi!"));
    const msg = await server.sockets[0].kernel.on("/", (d) => d).wait();
    expect(msg).toBe("Hi!");

    const serverAsClient = server.sockets[0].kernel.inject(Socket);
    process.nextTick(() => serverAsClient.send("/", "Hey!"));
    const msg2 = await client.socket.kernel.on("/", (d) => d).wait();
    expect(msg2).toBe("Hey!");
  });

  it("should works with @on", async () => {

    const client = kernelClient.inject(Socket);
    const server: SocketServerProvider = kernelServer.inject(SocketServerProvider);
    const serverAsClient = server.sockets[0].kernel.inject(Socket);

    expect(MyService.stack).toBe(0);
    serverAsClient.send("notification");
    await client.socket.kernel.on("notification").wait();
    expect(MyService.stack).toBe(1);

    expect(MyServerService.stack).toBe(0);
    client.send("something");
    await server.sockets[0].kernel.on("something").wait();
    expect(MyServerService.stack).toBe(1);
  });
});
