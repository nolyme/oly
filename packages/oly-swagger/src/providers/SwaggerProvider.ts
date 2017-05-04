import { ApiProvider, KoaRouterBuilder, lyRouter } from "oly-api";
import { _, IDeclarations, inject, Kernel, Logger, MetadataUtil } from "oly-core";
import { HttpServerProvider, serve } from "oly-http";
import { ObjectMapper } from "oly-mapper";
import { join } from "path";

/**
 * Auto-generate SwaggerSpec based on @route.
 *
 * @experimentation
 * @shitty
 */
export class SwaggerProvider {

  /**
   *
   */
  public swagger: any;

  @inject(ObjectMapper)
  protected objectMapper: ObjectMapper;

  @inject(HttpServerProvider)
  protected httpServerProvider: HttpServerProvider;

  @inject(KoaRouterBuilder)
  protected koaRouterBuilder: KoaRouterBuilder;

  @inject(ApiProvider)
  protected apiProvider: ApiProvider;

  @inject(Logger)
  protected logger: Logger;

  @inject(Kernel)
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
        title: this.kernel.env("OLY_APP_NAME") || "MyApp",
        version: "1.0.0",
      },
      paths: {},
      schemes: ["http"],
      swagger: "2.0",
      tags: [],
    };

    for (const dep of deps) {
      if (MetadataUtil.has(lyRouter, dep.definition)) {

        const router = this.koaRouterBuilder.createFromDefinition(dep.definition);

        this.swagger.tags.push({
          description: "",
          name: dep.definition.name,
        });

        for (const layer of router.stack) {

          const route: any = this.getRouteByLayer(dep.definition, layer);
          const api: any = _.assign({
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
                this.swagger.definitions[arg.body.name] = this.objectMapper.schema(arg.body);
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

    this.apiProvider.mount("/swagger/ui", serve(join(__dirname, "/../../resources/swagger-ui")));
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

    const router = MetadataUtil.deep(lyRouter, Type) as any;

    for (const propertyKey of Object.keys(router.routes)) {
      const r = router.routes[propertyKey];

      if (r.method === "DEL" && (router.prefix || "") + r.path === layer.path) {
        return _.assign({}, r, {propertyKey});
      }

      if (r.method === layer.methods[layer.methods.length - 1] && (router.prefix || "") + r.path === layer.path) {
        return _.assign({}, r, {propertyKey});
      }
    }
  }
}
