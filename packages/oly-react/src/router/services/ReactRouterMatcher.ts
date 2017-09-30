import { Global, inject, Kernel, Logger } from "oly";
import * as pathToRegexp from "path-to-regexp";
import { compile } from "path-to-regexp";
import * as qs from "qs";
import { createElement } from "react";
import { Layer } from "../components/Layer";
import { MatcherException } from "../exceptions/MatcherException";
import { IChunks, IHrefQuery, IMatch, INode, IRoute, ITransition } from "../interfaces";

export class ReactRouterMatcher {

  @inject
  protected logger: Logger;

  @inject
  protected kernel: Kernel;

  /**
   * Create a URL based on routes and a query.
   *
   * @param routes
   * @param go
   * @param context
   * @return {string}
   */
  public href(routes: IRoute[], go: IHrefQuery | string, context?: IMatch): string | undefined {

    const options: IHrefQuery = typeof go === "object" ? {...go} : {to: go};
    let url;

    // ignore (#.*)/
    if (options.to[0] === "#") {
      options.to = options.to.slice(options.to.indexOf("/"));
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
    if (options.query && url.indexOf("?") === -1) {
      url += "?" + qs.stringify(options.query);
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
      const parent = nodes.filter((s) => s.name === parents[0].parent)[0];
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
      const [, raw] = url.split("?");
      if (raw) {
        return qs.parse(raw);
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
      if (route.regexp && route.name !== "error") {
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
    if (n1.path.indexOf(":") > -1) {
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

  /**
   * Invoke a function and try to map the result in chunks.
   *
   * @param transition    Current transition to parse
   * @param index         Level in the stack of the resolve
   */
  public async resolve(transition: ITransition, index: number): Promise<IChunks | ITransition | undefined> {

    const target = transition.to.route.stack[index].target;
    const propertyKey = transition.to.route.stack[index].propertyKey;

    this.logger.trace("resolve " + Global.identity(target, propertyKey));

    let raw = await this.kernel.invoke(target, propertyKey, [transition, index]);

    this.logger.trace("resolve " + Global.identity(target, propertyKey) + " OK");

    // nothing is allowed, this will block the transition
    if (!raw) {
      this.logger.debug("resolve is aborted: nothing was returned");
      return;
    }

    // also, if you return another transition (redirection is this case) we stop this one
    if (typeof raw === "object" && typeof raw.to === "object" && typeof raw.to.path === "string") {
      this.logger.debug("resolve is aborted: redirection", {raw});
      return raw;
    }

    // try to create chunks (map of string - jsx.element)
    if (typeof raw === "function") {
      raw = {main: createElement(raw)};
    } else if (typeof raw === "object" && !Array.isArray(raw)) {
      if (raw["$$typeof"]) { // tslint:disable-line
        raw = {main: raw};
      } else {
        for (const key of Object.keys(raw)) {
          raw[key] = typeof raw[key] === "function"
            ? createElement(raw[key])
            : raw[key];
        }
      }
    } else {
      raw = {main: raw};
    }

    for (const key of Object.keys(raw)) {
      raw[key] = createElement(Layer, {id: index + 1}, raw[key]);
    }

    return raw;
  }
}
