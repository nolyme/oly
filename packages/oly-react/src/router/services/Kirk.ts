import { inject, Logger } from "oly-core";
import * as pathToRegexp from "path-to-regexp";
import { compile } from "path-to-regexp";
import { KirkException } from "../exceptions/KirkException";
import { IHrefQuery, IMatch, INode, IRoute } from "../interfaces";

export class Kirk {

  @inject
  protected logger: Logger;

  /**
   * Create a URL based on routes and a query.
   *
   * @param routes
   * @param go
   * @param context
   * @return {string}
   */
  public href(routes: IRoute[], go: IHrefQuery | string, context?: IMatch): string | undefined {

    const options: IHrefQuery = typeof go === "object" ? go : {to: go};
    let url;

    if (options.to[0] === "/") { // do not process query nor param here
      url = options.to;
    } else {
      url = this.findRouteByName(routes, options.to);
    }

    if (!url) {
      return;
    }

    // check params
    if (options.params) {
      url = compile(url)(options.params);
    }

    // check query
    if (options.query) {
      const keys = Object.keys(options.query);
      for (const key of keys) {
        const sep = (url.indexOf("?") > -1) ? "&" : "?";
        url += sep + key + "=" + options.query[key];
      }
    }

    return url;
  }

  /**
   * Map a node to a list of nodes based on parents.
   *
   * @param nodes
   * @param target
   * @return {INode[]}
   */
  public parents(nodes: INode[], target: INode): INode[] {
    const parents: INode[] = [target];
    while (parents[0].parent) {
      const parent = nodes.find((s) => s.name === parents[0].parent);
      if (parent) {
        parents.unshift(parent);
      } else {
        throw new KirkException(`Parent '${parents[0].parent}' of state '${parents[0].name}' doesn't exists`);
      }
    }
    return parents;
  }

  /**
   * Join node to get a complete url.
   *
   * @param nodes
   * @return {string}
   */
  public join(nodes: INode[]): string {
    return nodes.map((s) => s.path).join("").replace(/\/\//igm, "/");
  }

  /**
   * Parse query string.
   *
   * @param url
   */
  public query(url: string): { [key: string]: string } {
    try {
      const [, qs] = url.split("?");
      if (qs) {
        return qs.split("&").reduce((o, part) => {
          const [k, v] = part.split("=");
          o[k] = v;
          return o;
        }, {});
      }
    } catch (e) {
      this.logger.warn(`Query parsing of '${url}' has failed`, e);
    }
    return {};
  }

  /**
   * Create a match.
   *
   * @param routes
   * @param path
   */
  public match(routes: IRoute[], path: string): IMatch {

    const [pathWithoutQuery] = path.split("?");

    for (const route of routes) {
      if (route.regexp) {
        const result = route.regexp.exec(pathWithoutQuery);
        if (!result) {
          continue;
        }
        return {
          path,
          route,
          query: this.query(path),
          params: route.regexp.keys.reduce((p, key, i) => {
            p[key.name] = result[i + 1];
            return p;
          }, {}),
        };
      }
    }
    throw new KirkException(`There is no route for ${path}, you should add a 404 handler to avoid this error`);
  }

  /**
   * Create a list of routes.
   *
   * @param nodes
   */
  public createRoutes(nodes: INode[]): IRoute[] {

    const routes: IRoute[] = [];
    const sorted = nodes.sort((a, b) => {
      if (a.path.match(/\*/mgi)) {
        if (b.path.match(/\*/mgi)) {
          if (a.path.length < b.path.length) {
            return -1;
          }
          if (a.path.length > b.path.length) {
            return 1;
          }
        }
        return 1;
      }
      if (b.path.match(/\*/mgi)) {
        return -1;
      }
      if (a.path.match(/:/mgi)) {
        if (b.path.match(/:/mgi)) {
          if (a.path.length < b.path.length) {
            return -1;
          }
          if (a.path.length > b.path.length) {
            return 1;
          }
        }
        return 1;
      }
      if (b.path.match(/:/mgi)) {
        return -1;
      }
      if (a.path.length < b.path.length) {
        return -1;
      }
      if (a.path.length > b.path.length) {
        return 1;
      }
      return 0;
    });

    sorted.forEach((node) => {
      const parents = this.parents(nodes, node);
      const path = this.join(parents);
      const route: IRoute = {
        node,
        name: parents.map((s) => s.name).join("."),
        stack: parents,
        path,
      };
      if (!node.abstract && node.path) {
        route.regexp = pathToRegexp(path);
      } else {
        route.abstract = true;
      }
      routes.push(route);
    });

    return routes;
  }

  /**
   *
   */
  public findRouteByName(routes: IRoute[], pathname: string): string | undefined {
    const parts = pathname.split(".");
    const size = parts.length - 1;
    if (size === 0) {
      for (const route of routes) {
        // first, check as node name
        if (route.node.name === pathname) {
          return route.path;
        }
      }
    } else {
      let url: string = "";
      let last: string | undefined;
      for (let i = 0; i < size + 1; i++) {
        let updated = false;
        for (const route of routes) {
          if (route.node.name === parts[i] && (!last || route.node.parent === last)) {
            url = route.path;
            last = route.node.name;
            updated = true;
            break;
          }
        }
        if (!updated) {
          return;
        }
      }
      return url;
    }
  }
}
