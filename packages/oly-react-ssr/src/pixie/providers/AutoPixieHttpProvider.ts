import { IDeclarations, inject, Kernel, Logger } from "oly-core";
import { IRouterMetadata, MetaRouter } from "oly-router";
import { PixieHttp } from "../services/PixieHttp";

export interface IAutoRequest {
  body?: object;
  query: object;
  url: string;
  method: string;
}

/**
 * Use Api to create Http clients.
 */
export class AutoPixieHttpProvider {

  @inject
  private http: PixieHttp;

  @inject
  private logger: Logger;

  @inject
  private kernel: Kernel;

  /**
   * Connector.
   *
   * @param {IAutoRequest} request
   */
  public fetchRequest(request: IAutoRequest): Promise<any> {
    return this.http.request({
      url: request.url,
      method: request.method,
      params: request.query,
      data: request.body,
    });
  }

  /**
   * Replace all api by http request.
   *
   * @param {IDeclarations} declarations
   */
  public onStart(declarations: IDeclarations): void {
    for (const d of declarations) {
      const meta = MetaRouter.get(d.definition);
      if (!meta) {
        continue;
      }

      this.logger.debug(`swap ${d.definition.name}`);
      const keys = Object.keys(meta.properties);
      d.instance = d.instance || this.kernel.inject(d.definition);
      for (const propertyKey of keys) {
        d.instance[propertyKey] = (...entries: any[]) => {
          const request = this.createRequest(meta, propertyKey, entries);
          return this.fetchRequest(request);
        };
      }
    }
  }

  /**
   * Parse @body & cie and create a returns an http client interface.
   *
   * @param {IRouterMetadata} meta
   * @param {string} propertyKey
   * @param {any[]} entries
   * @returns {IAutoRequest}
   */
  public createRequest(meta: IRouterMetadata, propertyKey: string, entries: any[]): IAutoRequest {
    const prop = meta.properties[propertyKey];
    const args = meta.args[propertyKey] || [];
    const prefix = meta.target.prefix || "";

    // extract @params
    const pathParams = args.reduce((obj, item, index) => {
      if (item.kind === "param") {
        obj[item.name] = entries[index];
      }
      return obj;
    }, {});

    // extract @query
    const queryParams = args.reduce((obj, item, index) => {
      if (item.kind === "query") {
        obj[item.name] = entries[index];
      }
      return obj;
    }, {});

    const url = (prefix + prop.path
      // (?) replace '/abc/:id' by '/abc/0001'
        .replace(/:(\w*)/g, (match, name) => pathParams[name])
    ).replace(/\/\//g, "/");

    const request: IAutoRequest = {
      url,
      method: prop.method.toUpperCase(),
      query: queryParams,
    };

    // DEL is used everywhere, but in fact, it's DELETE, not DEL
    if (request.method === "DEL") {
      request.method = "DELETE";
    }

    if (request.method === "POST" || request.method === "PUT") {
      // extract @body
      const index = args.findIndex((arg) => arg.kind === "body");
      request.body = entries[index];
    }

    return request;
  }
}
