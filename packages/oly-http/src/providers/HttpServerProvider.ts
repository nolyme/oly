import { createServer, Server } from "http";
import * as Koa from "koa";
import { env, inject, IProvider, Kernel, Logger, state } from "oly-core";
import { IKoaMiddleware } from "../interfaces";
import { context } from "../middlewares";

/**
 * Default http server provider
 */
export class HttpServerProvider implements IProvider {

  /**
   *
   */
  @env("OLY_HTTP_SERVER_HOST")
  protected readonly host: string = "127.0.0.1";

  /**
   *
   */
  @env("OLY_HTTP_SERVER_PORT")
  protected readonly port: number = 3000;

  /**
   * Kernel.
   * We use kernel here to fork context on each request.
   */
  @inject
  protected readonly kernel: Kernel;

  /**
   * Logger.
   */
  @inject
  protected readonly logger: Logger;

  /**
   * Koa application.
   * Http Server is provided with Koa.
   */
  @state
  protected readonly app: Koa;

  /**
   * NodeJS Http Server instance.
   */
  @state
  protected http: Server;

  /**
   * Initialize once koa.
   */
  public constructor() {
    // initialize global state with a new koa instance
    this.app = new Koa();
  }

  /**
   * Hostname getter.
   * Protocol is forced to http as we only use Http Server.
   */
  public get hostname(): string {
    return `http://${this.host}:${this.port}`;
  }

  /**
   * Configure middleware before onStart().
   *
   * @param middleware
   */
  public use(middleware: IKoaMiddleware) {
    this.app.use(middleware);
    return this;
  }

  /**
   * Start the http server.
   * Listen new connections.
   */
  public onStart(): Promise<void> {

    // override koa context with our forked kernel
    // we fork kernel to protect the main layer
    this.app.use(context(this.kernel));

    // start server
    return new Promise<void>((resolve, reject) => {
      this.http = this.createServer();
      this.http.listen(this.port, this.host, (err: Error) => {
        if (err) {
          return reject(err);
        }
        this.logger.info(`server is listening on ${this.hostname}`);
        resolve();
      });
    });
  }

  /**
   * Stop http server.
   * We don't wait the callback.
   */
  public onStop(): Promise<void> {

    // stop server
    this.logger.info("kill server");
    return new Promise<void>((resolve, reject) => this.http.shutdown((err: Error) => {
      err ? reject(err) : resolve();
    }));
  }

  /**
   *
   */
  protected createServer(): Server {
    return require("http-shutdown")(createServer(this.app.callback()));
  }
}

// override default interface
declare module "http" {
  interface Server { // tslint:disable-line
    shutdown: Function;
  }
}
