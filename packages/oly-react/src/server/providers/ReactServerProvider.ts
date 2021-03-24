import * as cheerio from "cheerio";
import { env, Global, IDeclarations, inject, IProvider, Kernel, Logger, state } from "oly";
import { HttpServerProvider, IKoaContext, IKoaMiddleware, mount } from "oly-http";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { Helmet } from "react-helmet";
import { AppContext } from "../../core/components/AppContext";
import { ITransitionError } from "../../index";
import { Pixie } from "../../pixie/services/Pixie";
import { View } from "../../router/components/View";
import { ReactRouterProvider } from "../../router/providers/ReactRouterProvider";
import { ReactProxyService } from "../services/ReactProxyService";
import { ReactStaticService } from "../services/ReactStaticService";

/**
 *
 */
export class ReactServerProvider implements IProvider {

  /**
   * Where to mount react app.
   */
  @env("REACT_ID")
  public mountId: string = "app";

  /**
   * Where to find react browser app.
   */
  @env("REACT_SERVER_POINTS")
  public points: string[] | string = [
    "www",
    "http://localhost:8080",
    "DEFAULT",
  ];

  @state
  public transforms: (($: cheerio.Root, ctx: IKoaContext) => any)[] = [];

  @state
  protected template: string;

  @inject
  protected httpServerProvider: HttpServerProvider;

  @inject
  protected reactRouterProvider: ReactRouterProvider;

  @inject
  protected kernel: Kernel;

  @inject
  protected logger: Logger;

  @inject
  protected reactProxy: ReactProxyService;

  @inject
  protected reactStatic: ReactStaticService;

  /**
   * This is useless if you use ReactStatic or ReactProxy.
   */
  public generateIndex(prefix: string, mountId: string) {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head><body><div id="${mountId}"></div></body></html>`;
  }

  /**
   * Make the react rendering.
   *
   * @param ctx             IKoaContext
   * @param template        index.html
   */
  public render(ctx: IKoaContext, template: string): string {

    const $ = cheerio.load(template);

    this.renderReact($, ctx);
    this.renderHelmet($, ctx);
    this.renderPixie($, ctx);
    this.transforms.forEach((tt) => tt($, ctx));

    return $.html();
  }

  public renderReact($: cheerio.Root, ctx: IKoaContext) {
    const markup = renderToString(this.rootElement(ctx.kernel));
    $("#" + this.mountId).append(markup);
  }

  public renderPixie($: cheerio.Root, ctx: IKoaContext) {
    const pixie: Pixie = ctx.kernel.inject(Pixie);
    $("body").prepend(pixie.store.toHTML());
  }

  public renderHelmet($: cheerio.Root, ctx: IKoaContext) {
    const helmet = Helmet.renderStatic();

    const htmlAttrs = helmet.htmlAttributes
      .toString()
      .split(" ")
      .map((el) => el.trim())
      .filter((el) => !!el);
    for (const attr of htmlAttrs) {
      const [key, value] = attr.split("=");
      $("html").attr(key, value.replace(/"/g, ""));
    }

    const bodyAttrs = helmet.bodyAttributes
      .toString()
      .split(" ")
      .map((el) => el.trim())
      .filter((el) => !!el);
    for (const attr of bodyAttrs) {
      const [key, value] = attr.split("=");
      $("body").attr(key, value.replace(/"/g, ""));
    }

    const title = helmet.title.toString();
    if (title && title !== "<title data-react-helmet=\"true\"></title>") {
      $("head").remove("title").append(title);
    }

    const meta = helmet.meta.toString();
    if (meta) {
      $("head").append(meta);
    }

    const link = helmet.link.toString();
    if (link) {
      $("head").append(link);
    }
  }

  /**
   * In very few cases, SSR can failed.
   *
   * @param ctx         Koa Context with Kernel
   * @param template    App template with styles + scripts
   * @param error       The holy error
   * @returns {string}
   */
  public renderError(ctx: IKoaContext, template: string, error: Error): string {
    return template.replace(/<body(.*)>[\s\S]*<\/body>/igm, `
        <body$1>
        <div style="padding: 50px">
        <strong>Looks like something went wrong!</strong>
        <div>${!Global.isProduction()
      ? `<pre style="overflow-x: auto; padding: 10px; font-size: 12px">${error.stack || error.message || error}</pre>`
      : ""}
        </div>
        </div>
        </body>
    `);
  }

  /**
   *
   */
  public rootElement(kernel: Kernel): JSX.Element {
    return createElement(AppContext, {kernel}, createElement(View, {index: 0}));
  }

  /**
   * Get the react app prefix.
   */
  public get hostname(): string {
    return this.httpServerProvider.hostname + this.reactRouterProvider.prefix;
  }

  /**
   * Mount a koa middleware on the react-server way.
   *
   * @param middleware    Koa Middleware
   */
  public use(middleware: IKoaMiddleware): ReactServerProvider {
    this.httpServerProvider.use(mount(this.reactRouterProvider.prefix, middleware));
    return this;
  }

  /**
   * Hook - start
   *
   * @param deps  Kernel dependencies
   */
  public async onStart(deps: IDeclarations): Promise<void> {

    await this.createTemplate();

    this.use((ctx, next) => {

      ctx.kernel.get(Pixie).init();

      return next();
    });

    this.use(this.requestHandlerMiddleware());
  }

  /**
   * Get the default template.
   */
  protected async getDefaultTemplate(): Promise<string> {
    return this.generateIndex(this.reactRouterProvider.prefix, this.mountId);
  }

  /**
   * Default behavior for the react server.
   */
  protected requestHandlerMiddleware(): IKoaMiddleware {
    return async (ctx: IKoaContext, next) => {

      // await the end
      await next();

      // now,
      // - check if we are in 404 (default behavior with koa)
      if (ctx.status !== 404) {
        return;
      }

      // - check if body is empty (default behavior with koa)
      if (!!ctx.body) {
        return;
      }

      // - check if we are in /api
      const prefix = ctx.kernel.env("API_PREFIX");
      if (!!prefix && ctx.url.indexOf(prefix) === 0) {
        return;
      }

      const kernel: Kernel = ctx.kernel;
      const logger: Logger = kernel.inject(Logger).as("ReactServer");
      const router: ReactRouterProvider = kernel.inject(ReactRouterProvider);

      try {
        // find route + resolve
        const tr = await router.transition({to: ctx.req.url || "/"});

        if (tr && tr.type === "REPLACE") {
          logger.debug(`redirect request to ${tr.to.path}`);
          ctx.redirect(tr.to.path);
          return;
        }

        if (tr && (tr as ITransitionError).error) {
          ctx.status = 500;
        }

        // build page
        ctx.body = this.render(ctx, this.template);

      } catch (e) {
        logger.error("server rendering has failed", e);
        ctx.status = e.status || 500;
        ctx.body = this.renderError(ctx, this.template, e);
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
        } else if (point === "DEFAULT") {
          this.template = await this.getDefaultTemplate();
        } else if (point[0] === "<" && point[point.length - 1] === ">") {
          this.template = point;
        } else {
          this.template = await this.reactStatic.getTemplate(point);
          this.use(this.reactStatic.useStatic(point));
        }
        this.logger.info(`use point ${point}`);
        break;
      } catch (e) {
        this.logger.debug(`point ${point} is rejected`);
      }
    }

    if (!this.template) {
      throw new Error("There is no template available. " +
        "Please set REACT_SERVER_POINTS with one or more valid points");
    }

    const $ = cheerio.load(this.template);

    if ($("#" + this.mountId).length === 0) {
      throw new Error(`React mount-point #${this.mountId} is not found in the current template`);
    }
  }
}
