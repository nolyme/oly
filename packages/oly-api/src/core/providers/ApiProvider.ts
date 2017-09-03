import * as koaBodyParser from "koa-bodyparser";
import { Class, env, IDeclarations, inject, IProvider, Logger, Meta } from "oly";
import { HttpServerProvider, IKoaMiddleware, mount } from "oly-http";
import { olyApiKeys } from "../constants/keys";
import { MethodNotAllowedException } from "../exceptions/MethodNotAllowedException";
import { NotImplementedException } from "../exceptions/NotImplementedException";
import { IRouterMetadata } from "../interfaces";
import { ApiMiddlewares } from "../services/ApiMiddlewares";

/**
 * ```ts
 *
 * class App {
 *   @get("/") root(ctx: IKoaContext) {
 *     return "body";
 *   }
 * }
 *
 * Kernel.create().with(ApiProvider, App).start();
 * ```
 */
export class ApiProvider implements IProvider {

  /**
   * Define a global namespace to your path api.
   */
  @env("API_PREFIX")
  public prefix: string = "/api";

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
    const router = this.createFromDefinition(definition);
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
      if (Meta.of({key: olyApiKeys.router, target: declaration.definition}).has()) {
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
   * Default multipart parser.
   */
  protected useMulter(file: string): IKoaMiddleware {
    const multer: any = require("koa-multer"); // tslint:disable-line
    return multer({
      storage: multer.memoryStorage(),
      limit: {fileSize: 5000000},
    }).single(file) as any;
  }

  /**
   * Mount koa-router on HttpServerProvider.
   *
   * @param router    Koa router instance
   */
  protected mountRouter(router: any): this {
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
  protected logRouter(router: any, definition: Function): this {
    this.logger.trace(`prepare ${definition.name}`);
    for (const layer of router.stack) {
      const method = layer.methods[layer.methods.length - 1];
      const path = (this.prefix + layer.path).replace(/\/\//, "/");
      this.logger.debug(`mount ${method} ${path} -> ${definition.name}#${(layer as any).propertyKey}()`);
    }
    return this;
  }

  /**
   * Transform router metadata into a fresh koa-router object.
   *
   * @param definition   Annotated class with router metadata
   */
  protected createFromDefinition(definition: Class): any {

    const routerMetadata = Meta.of({key: olyApiKeys.router, target: definition}).deep();
    if (!routerMetadata) {
      throw new Error("There is no meta router in this class");
    }

    const koaRouter = this.createKoaRouter(routerMetadata);
    const propertyKeys = Object.keys(routerMetadata.properties);
    for (const propertyKey of propertyKeys) {

      const route = routerMetadata.properties[propertyKey];
      const mountFunction = koaRouter[route.method.toLowerCase()];
      const middlewares = route.middlewares.concat([]);
      if (routerMetadata.args[propertyKey]) {
        const isMultipart = routerMetadata.args[propertyKey].filter((arg) => arg.kind === "file")[0];
        if (isMultipart) {
          middlewares.push(this.useMulter(isMultipart.name));
        }
      }

      mountFunction.apply(koaRouter, [
        route.path,
        ...middlewares,
        this.apiMiddlewares.invoke(definition, propertyKey),
      ]);

      koaRouter
        .stack[koaRouter.stack.length - 1]
        .propertyKey = propertyKey;
    }

    return koaRouter;
  }

  /**
   * Create a new koa-router instance.
   *
   * @param {IRouterMetadata} routerMetadata
   * @returns {Router}
   */
  protected createKoaRouter(routerMetadata: IRouterMetadata) {
    const target = routerMetadata.target;
    const prefix = (!!target.prefix && target.prefix !== "/") ? target.prefix : "";
    return new (require("koa-router"))({prefix});
  }
}
