import { Exception, inject, Kernel } from "oly-core";
import { IHrefQuery, IMatch, ITransition } from "../interfaces";
import { ReactRouterProvider } from "../providers/ReactRouterProvider";
import { Browser } from "./Browser";

export class Router {

  @inject
  protected kernel: Kernel;

  @inject
  protected routerProvider: ReactRouterProvider;

  @inject
  protected browser: Browser;

  /**
   * Get the current route node definition.
   */
  public get current(): IMatch {
    if (!this.routerProvider.match) {
      throw new Exception(`There is no route yet`);
    }
    return this.routerProvider.match;
  }

  /**
   * Go to a named node.
   *
   * ```ts
   * // path is allowed
   * router.go("/");
   * // or node name
   * router.go("index");
   * // or route name
   * router.go("root.home");
   * // use object to pass params/query
   * router.go({to: "root.users.byId", params: {userId: "1"}});
   * // path is also allowed here
   * router.go({to: "/", query: {a: "b"}});
   * ```
   */
  public go(query: string | IHrefQuery): Promise<ITransition> {
    return this.routerProvider.transition(typeof query === "string" ? {to: query} : query);
  }

  /**
   * Remove layers and go to the current path as REPLACE.
   *
   * ```ts
   * router.reload();
   * ```
   */
  public reload(): Promise<ITransition> {
    this.routerProvider.layers = [];
    return this.go({to: this.current.path, type: "REPLACE"});
  }

  /**
   * Use history forward.
   */
  public forward(): void {
    this.browser.history.goForward();
  }

  /**
   * Use history back.
   */
  public back(): void {
    this.browser.history.goBack();
  }

  /**
   * Get the path of a route node.
   *
   * @param query   Path/NodeName/RouteName
   */
  public href(query: string | IHrefQuery): string | undefined {
    const options = typeof query === "string" ? {to: query} : query;
    const href = this.routerProvider.href(options);
    if (href && this.kernel.env("REACT_ROUTER_HASH", Boolean)) {
      return "#" + href;
    }
    return href;
  }

  /**
   * Check if a route node is active.
   *
   * @param routeName     Path/NodeName/RouteName
   * @param strict        If true, check as STRICT EQUAL not CONTAINS
   */
  public isActive(routeName: string | IHrefQuery, strict: boolean = false): boolean {

    const href = this.href(routeName);
    if (!href) {
      return false;
    }

    const current = this.current.path.replace(/\/$/, "");
    const target = href.replace(/\/$/, "");

    if (strict) {
      return current === target;
    }

    if (current.indexOf(target) !== 0) {
      return false;
    }

    // note: we need to check the offset
    // for /abc/def
    // - /abc             is Active
    // - /abc/def         is Active
    // - /abc/d           is NOT Active :)
    const offset = current.replace(target, "")[0];

    return (!offset || offset === "/");
  }
}
