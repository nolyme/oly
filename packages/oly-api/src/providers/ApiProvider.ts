import * as koaBodyParser from "koa-bodyparser";
import { env, IClass, IDeclarations, inject, Logger } from "oly-core";
import { HttpError, HttpServerProvider, KoaMiddleware, mount } from "oly-http";
import { RouterMetadataUtil } from "oly-router";
import { IKoaRouter } from "../interfaces";
import { root } from "../middlewares/root";
import { KoaRouterBuilder } from "../services/KoaRouterBuilder";

/**
 *
 */
export class ApiProvider {

  /**
   * Define a global namespace to your path api.
   */
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
   * Transform controller to KoaRouter and push it to Koa.
   *
   * @param definition   Class with Router Metadata
   */
  public register(definition: IClass): void {
    const router = this.koaRouterBuilder.createFromDefinition(definition);
    this.logRouter(router, definition);
    this.mountRouter(router);
  }

  /**
   * Auto create controllers.
   *
   * @param declarations    List of declaration (kernel dependencies)
   */
  public scan(declarations: IDeclarations): void {
    for (const declaration of declarations) {
      if (RouterMetadataUtil.hasRouter(declaration.definition)) {
        this.register(declaration.definition);
      }
    }
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
    this.scan(declarations);
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
   * @param definition     Dependency definition used with this router
   */
  protected logRouter(router: IKoaRouter, definition: IClass) {
    this.logger.trace(`prepare ${definition.name}`);
    for (const layer of router.stack) {
      const method = layer.methods[layer.methods.length - 1];
      const path = (this.prefix + layer.path).replace(/\/\//, "/");
      this.logger.debug(`mount ${method} ${path} -> ${definition.name}#${(layer as any).propertyKey}()`);
    }
  }
}
