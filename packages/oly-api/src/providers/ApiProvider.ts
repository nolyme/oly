import * as koaBodyParser from "koa-bodyparser";
import { env, IAnyDeclaration, IDeclarations, inject, Logger, MetadataUtil } from "oly-core";
import { HttpError, HttpServerProvider, KoaMiddleware, mount } from "oly-http";
import { lyRouter } from "../constants";
import { IKoaRouter } from "../interfaces";
import { root } from "../middlewares/root";
import { KoaRouterBuilder } from "../services/KoaRouterBuilder";

/**
 *
 */
export class ApiProvider {

  @env("OLY_API_PREFIX")
  public prefix: string = "/api";

  @inject(KoaRouterBuilder)
  protected koaRouterBuilder: KoaRouterBuilder;

  @inject(HttpServerProvider)
  protected httpServerProvider: HttpServerProvider;

  @inject(Logger)
  protected logger: Logger;

  /**
   * Get current hostname based on configuration.
   * Api prefix is included.
   */
  public get hostname() {
    return this.httpServerProvider.hostname + this.prefix;
  }

  /**
   * Use a koa middleware.
   */
  public use(middleware: KoaMiddleware) {
    this.httpServerProvider.use(mount(this.prefix, middleware));
    return this;
  }

  /**
   * Mount a middleware on prefix. ('/', '/wat', ...)
   */
  public mount(prefix: string, middleware: KoaMiddleware) {
    return this.use(mount(prefix, middleware));
  }

  /**
   * Default koa body parser.
   */
  protected useBodyParser() {
    return this.use(koaBodyParser() as any);
  }

  /**
   * Hook - start
   *
   * @param declarations
   */
  protected async onStart(declarations: IDeclarations) {

    this.useBodyParser();
    this.use(root());
    this.logger.info(`prefix api with ${this.prefix}`);

    for (const declaration of declarations) {
      if (MetadataUtil.has(lyRouter, declaration.definition)) {
        const router = this.koaRouterBuilder.createFromDefinition(declaration.definition);
        this.logRouter(router, declaration);
        this.mountRouter(router);
      }
    }
  }

  /**
   * Mount koa-router on HttpServerProvider.
   *
   * @param router    Koa router instance
   */
  protected mountRouter(router: IKoaRouter) {
    this.use(router.routes() as any);
    this.use(router.allowedMethods({
      methodNotAllowed: () => new HttpError(405),
      notImplemented: () => new HttpError(501),
      throw: true,
    }) as any);
  }

  /**
   * Show routes on start up.
   *
   * @param router         Koa router instance
   * @param declaration    Dependency used with this router
   */
  protected logRouter(router: IKoaRouter, declaration: IAnyDeclaration) {
    this.logger.trace(`prepare ${declaration.definition.name}`);
    for (const layer of router.stack) {
      const method = layer.methods[layer.methods.length - 1];
      const path = (this.prefix + layer.path).replace(/\/\//, "/");
      this.logger.debug(`mount ${method} ${path} -> ${declaration.definition.name}#${(layer as any).propertyKey}()`);
    }
  }
}
