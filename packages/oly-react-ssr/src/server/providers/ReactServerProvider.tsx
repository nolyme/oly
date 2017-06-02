import * as cheerio from "cheerio";
import { env, IDeclarations, inject, IProvider, Kernel, Logger, state } from "oly-core";
import { HttpServerProvider, IKoaMiddleware, mount } from "oly-http";
import { ReactRouterProvider } from "oly-react";
import { join } from "path";
import { ReactProxyService } from "../services/ReactProxyService";
import { ReactServerRenderer } from "../services/ReactServerRenderer";
import { ReactStaticService } from "../services/ReactStaticService";

/**
 *
 */
export class ReactServerProvider implements IProvider {

  @env("OLY_REACT_SERVER_PREFIX")
  public prefix: string = "/";

  @env("OLY_REACT_ID")
  public mountId: string = "app";

  @env("OLY_REACT_SERVER_POINTS")
  public points: string[] | string = [
    join(process.cwd(), "www"),
    "http://localhost:8080",
    "default",
  ];

  @inject
  protected httpServerProvider: HttpServerProvider;

  @inject
  protected reactRouterProvider: ReactRouterProvider;

  @inject
  protected reactServerRenderer: ReactServerRenderer;

  @inject
  protected kernel: Kernel;

  @inject
  protected logger: Logger;

  @inject
  protected reactProxy: ReactProxyService;

  @inject
  protected reactStatic: ReactStaticService;

  @state
  protected template: string;

  /**
   * Get the react app prefix.
   */
  public get hostname(): string {
    return this.httpServerProvider.hostname + this.prefix;
  }

  /**
   * Mount a koa middleware on the react-server way.
   *
   * @param middleware    Koa Middleware
   */
  public use(middleware: IKoaMiddleware): ReactServerProvider {
    this.httpServerProvider.use(mount(this.prefix, middleware));
    return this;
  }

  /**
   * Hook - start
   *
   * @param deps  Kernel dependencies
   */
  public async onStart(deps: IDeclarations): Promise<void> {

    await this.createTemplate();

    this.use(this.requestHandlerMiddleware());

    this.logger.info("template is ready");
  }

  /**
   * Get the default template.
   */
  protected async getDefaultTemplate(): Promise<string> {
    return Promise.resolve(this.reactServerRenderer.generateIndex(this.prefix, this.mountId));
  }

  /**
   * Default behavior for the react server.
   */
  protected requestHandlerMiddleware(): IKoaMiddleware {
    return async (ctx, next) => {

      // wait the end
      await next();

      // now,
      // - check if we are in 404 (default behavior with koa)
      // - check if body is empty (default behavior with koa)
      // - check if url is not a file / assets
      if (ctx.status === 404 && !ctx.body && ctx.url.indexOf(".") === -1) {

        const kernel: Kernel = ctx.kernel;
        const logger: Logger = kernel.get(Logger).as("ReactRouter");
        const router = kernel.get(ReactRouterProvider);
        const renderer = kernel.get(ReactServerRenderer);

        logger.info(`incoming request ${ctx.method} ${ctx.path}`);
        logger.trace("page data", ctx.request.toJSON());

        try {
          // find route + resolve
          await router.transition(ctx.req.url || "/");

          // build page
          ctx.body = renderer.render(ctx, this.template, this.mountId);

        } catch (e) {
          logger.error("server rendering has failed", e);
          ctx.status = e.status || 500;
          ctx.body = renderer.renderError(ctx, this.template, this.mountId, e);
        }
      }
    };
  }

  /**
   * Create a new template (index.html empty)
   * Points are used to find the correct template.
   */
  protected async createTemplate(): Promise<void> {

    const points = typeof this.points === "string"
      ? [this.points]
      : this.points;

    for (const point of points) {
      try {
        if (point.indexOf("http") === 0) {
          this.template = await this.reactProxy.getTemplate(point);
          this.use(this.reactProxy.useProxy(point));
        } else if (point === "default") {
          this.template = await this.getDefaultTemplate();
        } else if (point[0] === "<" && point[point.length - 1] === ">") {
          this.template = point;
        } else {
          this.template = await this.reactStatic.getTemplate(point);
          this.use(this.reactStatic.useStatic(point));
        }
        this.logger.info(`use ${point} point`);
        break;
      } catch (e) {
        this.logger.warn(`point ${point} is rejected`);
      }
    }

    if (!this.template) {
      throw new Error("There is no template available. " +
        "Please set OLY_REACT_SERVER_POINTS with one or more valid points");
    }

    const $ = cheerio.load(this.template);

    if ($("#" + this.mountId).length === 0) {
      throw new Error(`React mount-point #${this.mountId} is not found in the current template`);
    }
  }
}
