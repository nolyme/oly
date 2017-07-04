import { IDeclarations, inject, Kernel, Logger } from "oly-core";
import { IRouterMetadata, MetaRouter } from "oly-router";
import { PixieHttp } from "../services/PixieHttp";

export interface IAutoRequest {
  body?: object;
  query: object;
  url: string;
  method: string;
  headers: object;
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
      headers: request.headers,
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

    // extract @header
    const headers = args.reduce((obj, item, index) => {
      if (item.kind === "header") {
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
      headers,
    };

    // DEL is used everywhere, but in fact, it's DELETE, not DEL
    if (request.method === "DEL") {
      request.method = "DELETE";
    }

    if (request.method === "POST" || request.method === "PUT") {

      console.log(args);
      const multiParts = args.filter((arg) => arg.kind === "file");
      if (multiParts.length > 0) {
        // extract @file
        const fd = new FormData();
        multiParts.forEach((arg) => {
          const i = args.indexOf(arg);
          fd.append(arg.name, entries[i]);
          console.log("azd", arg.name, "azd", entries[i]);
        });
        console.log(fd);
        request.body = fd;
      } else {
        // extract @body
        const index = args.findIndex((arg) => arg.kind === "body");
        request.body = entries[index];
      }
    }

    return request;
  }
}
