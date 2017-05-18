import * as cheerio from "cheerio";
import { env, IDeclarations, inject, Kernel, Logger, state } from "oly-core";
import { HttpServerProvider, IKoaContext, IKoaMiddleware, mount } from "oly-http";
import { IPageDefinition, RouterBuilder, RouterHooks } from "oly-react";
import { join } from "path";
import { match, RouteConfig, RouterState } from "react-router";
import { NotFoundException } from "../exceptions/PageNotFoundException";
import { ReactProxyService } from "../services/ReactProxyService";
import { ReactServerRenderer } from "../services/ReactServerRenderer";
import { ReactStaticService } from "../services/ReactStaticService";

/**
 *
 */
export class ReactServerProvider {

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

  @inject(HttpServerProvider)
  protected httpServerProvider: HttpServerProvider;

  @inject(RouterBuilder)
  protected routerBuilder: RouterBuilder;

  @inject(RouterHooks)
  protected routerHooks: RouterHooks;

  @inject(ReactServerRenderer)
  protected reactServerRenderer: ReactServerRenderer;

  @inject(Kernel)
  protected kernel: Kernel;

  @inject(Logger)
  protected logger: Logger;

  @inject(ReactProxyService)
  protected reactProxy: ReactProxyService;

  @inject(ReactStaticService)
  protected reactStatic: ReactStaticService;

  @state()
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
   * Get the default template.
   */
  protected async getDefaultTemplate(): Promise<string> {
    return Promise.resolve(this.reactServerRenderer.generateIndex(this.prefix, this.mountId));
  }

  /**
   * Default behavior for the react server.
   *
   * @param pages
   */
  protected useTemplate(pages: IPageDefinition[]) {
    return this.use(async (ctx, next) => {
      // wait the end
      await next();

      // now,
      // - check if we are in 404 (default behavior with koa)
      // - check if body is empty (default behavior with koa)
      // - check if url is not a file / assets
      if (ctx.status === 404 && !ctx.body && ctx.url.indexOf(".") === -1) {

        // make #match()
        await this.createHandler(ctx, this.template, pages);
      }
    });
  }

  /**
   * Create pages from kernel declarations.
   *
   * @param deps
   * @returns {IPageDefinition[]}
   */
  protected getPagesFromDependencies(deps: IDeclarations): IPageDefinition[] {
    return this.routerBuilder.createPages(deps.map((d) => d.definition));
  }

  /**
   * Hook - start
   *
   * @param deps  Kernel dependencies
   */
  protected async onStart(deps: IDeclarations): Promise<void> {

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

    this.useTemplate(this.getPagesFromDependencies(deps));

    this.logger.info("template is ready");
  }

  /**
   * Resolve routes !
   *
   * @param location      Url
   * @param routes        ReactRouter Routes
   */
  protected match(location: string,
                  routes: RouteConfig): Promise<{ redirectLocation: Location, nextState: RouterState }> {
    return new Promise((resolve, reject) => {
      match({location, routes}, (error, redirectLocation, nextState) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            redirectLocation,
            nextState,
          });
        }
      });
    });
  }

  /**
   * Translate koa request into into react page
   *
   * @param ctx         Koa Context
   * @param template    React default template
   * @param pages       React Router pages interface
   */
  protected async createHandler(ctx: IKoaContext, template: string, pages: IPageDefinition[]) {

    const context: Kernel = ctx.kernel;
    const logger: Logger = context.get(Logger).as("ReactRouter");
    const routes = this.routerBuilder.createRoutesFromPages(pages, context);

    logger.info(`incoming request ${ctx.method} ${ctx.path}`);
    logger.trace("page data", ctx.request.toJSON());

    try {
      // find route + resolve
      const {redirectLocation, nextState} = await this.match(ctx.req.url || "/", routes);

      // redirection if needed (--> when you call #replace('/') <--)
      if (!!redirectLocation) {
        const url = redirectLocation.pathname + redirectLocation.search;
        this.logger.debug(`redirect to ${url}`);
        return ctx.redirect(url);
      }

      // if nextState is not defined -> 404!
      // IMPORTANT: you should avoid this passage by @page('**') and handle 404 by yourself
      if (!nextState) {
        this.logger.warn("there is no default handler for page 404, you can set it with the annotation @page404()");
        throw new NotFoundException("Page not found");
      }

      // build page
      ctx.body = this.reactServerRenderer.render(ctx, template, this.mountId, nextState);

    } catch (e) {
      logger.error("server rendering has failed", e);
      ctx.status = e.status || 500;
      ctx.body = this.reactServerRenderer.renderError(ctx, template, this.mountId, e);
    }
  }
}
