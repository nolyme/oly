import { Global, IDeclarations, inject, Kernel, Logger, Meta } from "oly";
import { HttpServerProvider, serve } from "oly-http";
import { Json, olyMapperKeys } from "oly-json";
import { dirname } from "path";
import { IRouterArgument, IRouterProperty } from "../../";
import { olyApiKeys } from "../../core/constants/keys";
import { ApiProvider } from "../../core/providers/ApiProvider";
import { ISwaggerApi } from "../interfaces";

/**
 * The `SwaggerProvider` reads @get/@post/@field/... and creates a [Swagger JSON + Swagger UI](https://swagger.io/).
 *
 * - JSON: <API_PREFIX>/swagger.json
 * - UI: <API_PREFIX>/swagger/ui
 *
 * Currently supported:
 *
 * - Definitions
 * - Paths
 *
 * ```ts
 * class Data {
 *   @field name: string;
 * }
 *
 * class App {
 *   @post("/")
 *   createDate(@body data: Data) {
 *   }
 * }
 *
 * Kernel.create().with(SwaggerProvider, App).start();
 * ```
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
  protected apiProvider: ApiProvider;

  @inject
  protected logger: Logger;

  @inject
  protected kernel: Kernel;

  /**
   *
   * @param declarations
   */
  protected onConfigure(declarations: IDeclarations) {

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

    for (const dep of declarations) {
      const meta = Meta.of({key: olyApiKeys.router, target: dep.definition}).deep();
      if (meta) {

        this.swagger.tags.push({
          description: "",
          name: dep.definition.name,
        });

        const keys = Object.keys(meta.properties);
        for (const propertyKey of keys) {
          const prop = meta.properties[propertyKey];
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
            summary: propertyKey,
            tags: [dep.definition.name],
          }, prop.api || {});

          this.parseSecurity(api, prop);
          this.parseArguments(api, meta.args[propertyKey] || []);

          const path = ((meta.target.prefix || "/") + prop.path)
            .replace(/\/\//g, "/")
            .replace(/:(\w*)/g, "{$1}");

          const method = prop.method === "DEL" ? "DELETE" : prop.method;

          this.swagger.paths[path] = this.swagger.paths[path] || {};
          this.swagger.paths[path][method.toLowerCase()] = api;
        }
      }
    }

    this.mountSwagger();
  }

  protected mountSwagger() {
    this.apiProvider.mount("/swagger/ui", serve(dirname(require.resolve("swagger-ui-dist"))));
    this.apiProvider.mount("/swagger.json", async (ctx) => {
      ctx.body = JSON.stringify(this.swagger);
    });

    const swaggerURL = `${this.apiProvider.hostname}/swagger/ui/?url=${this.apiProvider.prefix}/swagger.json`;
    this.logger.info(`swagger ui ready on ${swaggerURL}`);
  }

  protected parseSecurity(api: ISwaggerApi, prop: IRouterProperty) {
    if (prop.roles) {
      api.security = [{Bearer: []}];
      this.swagger.securityDefinitions = {
        Bearer: {
          in: "header",
          name: "Authorization",
          type: "apiKey",
        },
      };
    }
  }

  protected parseArguments(api: ISwaggerApi, args: IRouterArgument[]) {
    for (const arg of args) {
      if (arg.kind === "param") {
        api.parameters.push({
          description: "ID",
          in: "path",
          name: arg.name,
          required: true,
          type: "string",
        });
      } else if (arg.kind === "query") {
        api.parameters.push({
          description: "Query Parameter",
          in: "query",
          name: arg.name,
          required: false,
          type: "string",
        });
      } else if (arg.kind === "body") {
        const hasMeta = Meta.of({key: olyMapperKeys.fields, target: arg.type}).has();
        api.parameters.push({
          description: "JSON Body",
          in: "body",
          name: arg.type.name,
          required: true,
          schema: hasMeta ? {
            $ref: "#/definitions/" + arg.type.name,
          } : undefined,
        });
        if (hasMeta) {
          this.swagger.definitions[arg.type.name] = this.json.schema(arg.type);
        }
      }
    }
  }
}
