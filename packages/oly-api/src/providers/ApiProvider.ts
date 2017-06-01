import * as koaBodyParser from "koa-bodyparser";
import { Class, env, IDeclarations, inject, IProvider, Logger } from "oly-core";
import { HttpServerProvider, IKoaMiddleware, mount } from "oly-http";
import { MetaRouter } from "oly-router";
import { MethodNotAllowedException } from "../exceptions/MethodNotAllowedException";
import { NotImplementedException } from "../exceptions/NotImplementedException";
import { IKoaRouter } from "../interfaces";
import { ApiMiddlewares } from "../services/ApiMiddlewares";
import { KoaRouterBuilder } from "../services/KoaRouterBuilder";

/**
 *
 */
export class ApiProvider implements IProvider {

  /**
   * Define a global namespace to your path api.
   */
  @env("OLY_API_PREFIX")
  public prefix: string = "/api";

  @inject
  protected koaRouterBuilder: KoaRouterBuilder;

  @inject
  protected apiMiddlewares: ApiMiddlewares;

  @inject
  protected httpServerProvider: HttpServerProvider;

  @inject
  protected logger: Logger;

  /**
   * Get current hostname based on configuration.
   * Api prefix is included.
   */
  public get hostname(): string {
    return this.httpServerProvider.hostname + this.prefix;
  }

  /**
   * Use a koa middleware.
   */
  public use(middleware: IKoaMiddleware): this {
    this.httpServerProvider.use(mount(this.prefix, middleware));
    return this;
  }

  /**
   * Mount a middleware on prefix. ('/', '/wat', ...)
   */
  public mount(prefix: string, middleware: IKoaMiddleware): this {
    return this.use(mount(prefix, middleware));
  }

  /**
   * Transform controller to KoaRouter and push it to Koa.
   *
   * @param definition   Class with Router Metadata
   */
  public register(definition: Class): this {
    const router = this.koaRouterBuilder.createFromDefinition(definition);
    return this
      .logRouter(router, definition)
      .mountRouter(router);
  }

  /**
   * Auto create controllers.
   *
   * @param declarations    List of declaration (kernel dependencies)
   */
  public scan(declarations: IDeclarations): void {
    for (const declaration of declarations) {
      if (MetaRouter.get(declaration.definition)) {
        this.register(declaration.definition);
      }
    }
  }

  /**
   * Hook - start
   *
   * @param declarations
   */
  public async onStart(declarations: IDeclarations): Promise<void> {
    this.use(this.apiMiddlewares.log());
    this.use(this.apiMiddlewares.errorHandler());
    this.useBodyParser();
    this.logger.info(`prefix api with ${this.prefix}`);
    this.scan(declarations);
  }

  /**
   * Default koa body parser.
   */
  protected useBodyParser(): this {
    return this.use(koaBodyParser() as any);
  }

  /**
   * Mount koa-router on HttpServerProvider.
   *
   * @param router    Koa router instance
   */
  protected mountRouter(router: IKoaRouter): this {
    this.use(router.routes() as any);
    this.use(router.allowedMethods({
      methodNotAllowed: () => new MethodNotAllowedException(),
      notImplemented: () => new NotImplementedException(),
      throw: true,
    }) as any);
    return this;
  }

  /**
   * Show routes on start up.
   *
   * @param router         Koa router instance
   * @param definition     Dependency definition used with this router
   */
  protected logRouter(router: IKoaRouter, definition: Function): this {
    this.logger.trace(`prepare ${definition.name}`);
    for (const layer of router.stack) {
      const method = layer.methods[layer.methods.length - 1];
      const path = (this.prefix + layer.path).replace(/\/\//, "/");
      this.logger.debug(`mount ${method} ${path} -> ${definition.name}#${(layer as any).propertyKey}()`);
    }
    return this;
  }
}
