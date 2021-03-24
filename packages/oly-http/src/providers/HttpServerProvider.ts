import { createServer, Server } from "http";
import * as Koa from "koa";
import { env, inject, IProvider, Kernel, Logger, state } from "oly";
import { helmet } from "../";
import { IKoaContext, IKoaMiddleware } from "../interfaces";
import { context } from "../middlewares";

/**
 * Default http server provider
 */
export class HttpServerProvider implements IProvider {

  /**
   * Set hostname of the http server.
   */
  @env("HTTP_SERVER_HOST")
  protected readonly host: string = "127.0.0.1";

  /**
   * Set port of the http server.
   */
  @env("HTTP_SERVER_PORT")
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
  protected readonly app: Koa = new Koa();

  /**
   * NodeJS Http Server instance.
   */
  @state
  protected http: Server;

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
  public use(middleware: IKoaMiddleware): HttpServerProvider {
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
    this
      .use(context(this.kernel))
      .useLogger()
      .useHelmet();

    // start server
    return new Promise<void>((resolve, reject) => {
      this.http = this.createServer();
      this.http.listen(this.port, this.host, () => {
        this.logger.info(`listening on ${this.hostname}`);
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
    this.logger.info("stop server");
    return new Promise<void>((resolve, reject) =>
      this.http.shutdown((err: Error) => {
        err ? reject(err) : resolve();
      }),
    );
  }

  /**
   * Use helmet middleware.
   *
   * @overridable
   */
  protected useHelmet(): HttpServerProvider {
    return this.use(helmet());
  }

  /**
   * Use a http logger middleware.
   *
   * @overridable
   */
  protected useLogger(): HttpServerProvider {
    this.use((ctx: IKoaContext, next: Function) => {

      const logger = ctx.kernel.get(Logger).as("HttpServer");
      const now = Date.now();
      logger.info(`--> ${ctx.method} ${ctx.path}`);
      logger.trace("incoming request", ctx.request.toJSON());

      return next().then(() => {

        const time = Date.now() - now;

        if (ctx.status === 500 && typeof ctx.body === "object") {
          logger.error("internal error", ctx.body ?? undefined);
        }

        logger.info(`<-- ${ctx.method} ${ctx.path} ${ctx.status} - ${time}ms`);
        logger.trace("response", ctx.response.toJSON());
      });
    });
    return this;
  }

  /**
   * @overridable
   */
  protected createServer(): Server {
    return require("http-shutdown")(createServer(this.app.callback()));
  }
}
