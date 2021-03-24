import { Exception, inject, Kernel, TypeParser } from "oly";
import * as qs from "qs";
import { IHrefQuery, IMatch, ITransition } from "../interfaces";
import { ReactRouterProvider } from "../providers/ReactRouterProvider";
import { Browser } from "./Browser";

/**
 * Public API of ReactRouterProvider.
 *
 * ```ts
 * class MyComponent extends React.Component {
 *   @inject router: Router
 *
 *   @action
 *   onClickSomewhere() { this.router.go("/") }
 *
 *   // ...
 * }
 * ```
 *
 * When a component injects Router, #forceUpdate is called after each transition.
 *
 * ```ts
 * class MyComponent extends React.Component {
 *   watchlist = []; // override watchlist
 * }
 * ```
 */
export class Router {

  @inject
  protected kernel: Kernel;

  @inject
  protected routerProvider: ReactRouterProvider;

  @inject
  protected browser: Browser;

  /**
   * Get the current route node definition.
   *
   * ```ts
   * const router = k.get(Router);
   *
   * router.current.path;     // "/abc/def"
   * router.current.params;   // {a: "b"}
   * router.current.query;    // {a: "b"}
   * router.current.route;    // IRoute
   * ```
   *
   * ### Limitation
   *
   * Avoid Router#current inside a page function.
   *
   * ```ts
   * class Pages {
   *   @inject router: Router;
   *
   *   @page index(tr: ITransition) {
   *     this.router.current.path; // bad (current=from)
   *     tr.from.path;             // good
   *     tr.to.path;               // good
   *   }
   * }
   * ```
   */
  public get current(): IMatch {
    if (!this.routerProvider.match) {
      throw new Exception(
        `Using Router#current (or isActive) inside the first resolve (@page) is not allowed. Use ITransition instead`);
    }
    return this.routerProvider.match;
  }

  /**
   * Go to a named node/route/path.
   *
   * ```ts
   * // path is allowed
   * router.go("/");
   *
   * // or node name
   * router.go("index");
   *
   * // or route name
   * router.go("root.home");
   *
   * // use object to pass params/query
   * router.go({to: "root.users.byId", params: {userId: "1"}, query: {clone: true}});
   *
   * // path is also allowed here
   * router.go({to: "/", query: {a: "b"}});
   * ```
   *
   * This method:
   * - returns a promise of `ITransition` if everything is ok.
   * - returns a promise of `undefined` if transition has been aborted.
   * - throws an exception if transition has failed.
   *
   * ### Context
   *
   * Current context is re-used. Some params can be omitted based on the relative position.
   */
  public go(to: string | IHrefQuery): Promise<ITransition | undefined> {
    return this.routerProvider.transition(typeof to === "string" ? {to} : to);
  }

  /**
   * Like Router#go, with type=REPLACE.
   *
   * @param {string | IHrefQuery} to
   * @returns {Promise<ITransition>}
   */
  public redirect(to: string | IHrefQuery): Promise<ITransition | undefined> {
    const query = typeof to === "string" ? {to} : to;
    query.type = "REPLACE";
    return this.routerProvider.transition(query);
  }

  /**
   * Remove layers and go to the current path as REPLACE.
   *
   * ```ts
   * router.reload();
   * ```
   */
  public reload(): Promise<ITransition | undefined> {
    this.routerProvider.layers = [];
    return this.go({to: this.current.path, type: "REPLACE"});
  }

  /**
   * Getter/Setter query param.
   *
   * ```ts
   * router.search("key"); // getter
   * router.search("key", "value"); // setter
   * ```
   *
   * ### Reload
   *
   * This will not reload the page.
   *
   * @param {string} key
   * @param {string} value
   * @returns {string}
   */
  public search(key: string, value: any): string | undefined {
    const query = this.current.query;

    if (arguments.length === 1) {
      return query[key];
    } else {
      const newValue = TypeParser.parseString(value);
      if (newValue) {
        query[key] = newValue;
        this.browser.history.replace({ // TODO: replace ( or push as option ) ?
          ...this.browser.history.location,
          search: qs.stringify(query),
        });
      }
    }
  }

  /**
   * Call browser-history goForward.
   */
  public forward(): void {
    this.browser.history.forward();
  }

  /**
   * Call browser-history goBack.
   */
  public back(): void {
    this.browser.history.back();
  }

  /**
   * Get the path of a route node. Interface is like Router#go().
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
   * Check if a route node is active. Interface is like Router#go().
   *
   * ### Strict
   *
   * Set strict=true to make a STRICT comparaison.
   *
   * ```ts
   * // current = "/abc";
   *
   * router.isActive("/abc"); // true
   * router.isActive("/abc/def"); // true
   * router.isActive("/abc/def", true); // false
   * ```
   *
   * @param routeName     Path/NodeName/RouteName
   * @param strict        If true, check as STRICT EQUAL not CONTAINS
   */
  public isActive(routeName: string | IHrefQuery, strict: boolean = false): boolean {

    const href = this.href(routeName);
    if (!href) {
      return false;
    }

    const current = this.current.path
      .replace(/\?.*$/, "")
      .replace(/\/$/, "")
      .replace("#", "");
    const target = href
      .replace(/\?.*$/, "")
      .replace(/\/$/, "")
      .replace("#", "");

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
