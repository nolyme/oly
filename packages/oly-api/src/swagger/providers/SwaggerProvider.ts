import { IDeclarations, inject, Kernel, Logger } from "oly-core";
import { HttpServerProvider, serve } from "oly-http";
import { Json } from "oly-json";
import { join } from "path";
import { Global } from "../../../../oly-core/src/kernel/Global";
import { ApiProvider } from "../../core/providers/ApiProvider";
import { KoaRouterBuilder } from "../../core/services/KoaRouterBuilder";
import { MetaRouter } from "../../router/MetaRouter";

/**
 * Auto-generate SwaggerSpec based on @route.
 *
 * @experimental
 */
export class SwaggerProvider {

  /**
   *
   */
  public swagger: any;

  @inject
  protected json: Json;

  @inject
  protected httpServerProvider: HttpServerProvider;

  @inject
  protected koaRouterBuilder: KoaRouterBuilder;

  @inject
  protected apiProvider: ApiProvider;

  @inject
  protected logger: Logger;

  @inject
  protected kernel: Kernel;

  /**
   *
   * @param deps
   */
  protected onConfigure(deps: IDeclarations) {

    this.swagger = {
      basePath: this.apiProvider.prefix || "/",
      definitions: {},
      host: `${this.httpServerProvider["host"]}:${this.httpServerProvider["port"]}`, // tslint:disable-line
      info: {
        description: "Swagger API",
        title: this.kernel.env("APP_NAME") || "MyApp",
        version: "1.0.0",
      },
      paths: {},
      schemes: ["http"],
      swagger: "2.0",
      tags: [],
    };

    for (const dep of deps) {
      if (MetaRouter.get(dep.definition)) {

        const router = this.koaRouterBuilder.createFromDefinition(dep.definition);

        this.swagger.tags.push({
          description: "",
          name: dep.definition.name,
        });

        for (const layer of router.stack) {

          const route: any = this.getRouteByLayer(dep.definition, layer);
          const api: any = Global.merge({
            parameters: [],
            produces: [
              "application/json",
            ],
            responses: {
              200: {
                description: "successful operation",
              },
            },
            summary: route.propertyKey,
            tags: [dep.definition.name],
          }, route.api || {});

          const isAuthOnly = !!layer.stack.filter((md: any) => md.name === "hasRoleMiddleware")[0];
          if (isAuthOnly) {
            this.swagger.securityDefinitions = {
              Bearer: {
                in: "header",
                name: "Authorization",
                type: "apiKey",
              },
            };
            api.security = [{Bearer: []}];
          }

          if (route.args) {
            for (const i of Object.keys(route.args)) {
              const arg = route.args[i];
              if (arg.path) {
                api.parameters.push({
                  description: "ID",
                  in: "path",
                  name: arg.path,
                  required: true,
                  type: "string",
                });
              }
              if (arg.query) {
                api.parameters.push({
                  description: "Query Parameter",
                  in: "query",
                  name: arg.query,
                  required: false,
                  type: "string",
                });
              }
              if (arg.body) {
                api.parameters.push({
                  description: "JSON Body",
                  in: "body",
                  name: "",
                  required: true,
                  schema: {
                    $ref: "#/definitions/" + arg.body.name,
                  },
                });
                this.swagger.definitions[arg.body.name] = this.json.schema(arg.body);
              }
            }
          }

          if (layer.stack.filter((md: any) => md.name === "hasRoleMiddleware")[0]) {
            this.swagger.securityDefinitions = {
              Bearer: {
                in: "header",
                name: "Authorization",
                type: "apiKey",
              },
            };
          }

          // replace /toto/:id/toto by /toto/{id}/toto
          const path = layer.path.replace(/:(\w*)/g, "{$1}");

          this.swagger.paths[path] = this.swagger.paths[path] || {};
          this.swagger.paths[path][layer.methods[layer.methods.length - 1].toLowerCase()] = api;
        }
      }
    }

    this.apiProvider.mount("/swagger/ui", serve(join(__dirname, "/../../../resources/swagger-ui")));
    this.apiProvider.mount("/swagger.json", async (ctx) => {
      ctx.body = JSON.stringify(this.swagger);
    });

    const swaggerURL = `${this.apiProvider.hostname}/swagger/ui/?url=${this.apiProvider.hostname}/swagger.json`;
    this.logger.info(`swagger ui ready on ${swaggerURL}`);
  }

  /**
   *
   * @param Type
   * @param layer
   */
  private getRouteByLayer(Type: any, layer: any): any {

    const router = MetaRouter.get(Type);
    if (router) {
      for (const propertyKey of Object.keys(router.properties)) {
        const r = router.properties[propertyKey];

        if (r.method === "DEL" && (router.target.prefix || "") + r.path === layer.path) {
          return Global.merge(r, {propertyKey});
        }

        if (r.method === layer.methods[layer.methods.length - 1]
          && (router.target.prefix || "") + r.path === layer.path) {
          return Global.merge(r, {propertyKey});
        }
      }
    }
  }
}
