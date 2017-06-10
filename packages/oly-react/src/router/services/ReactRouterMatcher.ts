import { Global, inject, Logger } from "oly-core";
import * as pathToRegexp from "path-to-regexp";
import { compile } from "path-to-regexp";
import { MatcherException } from "../exceptions/MatcherException";
import { IHrefQuery, IMatch, INode, IRoute } from "../interfaces";

export class ReactRouterMatcher {

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

    // ignore #
    if (options.to[0] === "#") {
      options.to = options.to.slice(1);
    }

    if (options.to[0] === "/") { // do not process query nor param here
      url = options.to;
    } else {
      url = this.getUrlByNodeName(routes, options.to);
    }

    if (!url) {
      return;
    }

    const params = context ? context.params : {};
    try {
      if (options.params) {
        url = compile(url)(Global.merge(params, options.params));
      } else {
        url = compile(url)(params);
      }
    } catch (e) {
      this.logger.warn(`Parameters are missing in ${url}`, e);
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
        throw new MatcherException(`Parent '${parents[0].parent}' of state '${parents[0].name}' doesn't exists`);
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

    throw new MatcherException(`There is no route for '${path}'`);
  }

  /**
   * Create a list of routes.
   *
   * @param nodes
   */
  public createRoutes(nodes: INode[]): IRoute[] {

    const routes: IRoute[] = [];

    nodes.forEach((node) => {
      const parents = this.parents(nodes, node);
      const path = this.join(parents);
      const route: IRoute = {
        node,
        name: parents.map((s) => s.name).join("."),
        stack: parents,
        path,
      };
      if (!node.abstract) {
        route.regexp = pathToRegexp(path);
      } else {
        route.abstract = true;
      }
      routes.push(route);
    });

    return routes;
  }

  /**
   * Compare two nodes with params.
   * This is useful when node have path variable (params).
   * We need to compile the local node path and compare with the two set of params.
   *
   * This use case is only browser-side.
   *
   * @param {IMatch} match1   Params 1
   * @param {IMatch} match2   Params 2
   * @param {number} level
   * @returns {boolean}       true if node1 === node2
   *
   * @memberof ReactRouterMatcher
   */
  public isEqualMatchLevel(match1: IMatch, match2: IMatch, level: number): boolean {

    if (match1.route.stack[level] !== match2.route.stack[level]) {
      return false;
    }

    const n1 = match1.route.stack[level];
    if (n1.path.includes(":")) {
      return compile(n1.path)(match1.params) === compile(n1.path)(match2.params);
    }

    return true;
  }

  /**
   *
   */
  public getUrlByNodeName(routes: IRoute[], nodeName: string): string | undefined {
    const parts = nodeName.split(".");
    const size = parts.length - 1;
    if (size === 0) {
      for (const route of routes) {
        // first, check as node name
        if (route.node.name === nodeName) {
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
