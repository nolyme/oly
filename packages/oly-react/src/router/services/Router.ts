import { Exception, inject, Kernel } from "oly-core";
import { IHrefQuery, IMatch, ITransition } from "../interfaces";
import { ReactBrowserProvider } from "../providers/ReactBrowserProvider";
import { ReactRouterProvider } from "../providers/ReactRouterProvider";
import { Browser } from "./Browser";

export class Router {

  @inject
  protected kernel: Kernel;

  @inject
  protected routerProvider: ReactRouterProvider;

  @inject
  protected browserProvider: ReactBrowserProvider;

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
   * router.go("index");
   * ```
   */
  public go(query: string | IHrefQuery): Promise<ITransition> {
    return this.routerProvider.transition(query);
  }

  public reload(): Promise<ITransition> {
    this.routerProvider.layers = [];
    return this.go({to: this.current.path, type: "REPLACE"});
  }

  public forward(): void {
    this.browser.history.goForward();
  }

  public back(): void {
    this.browser.history.goBack();
  }

  /**
   * Get the path of a route node.
   *
   * @param query
   */
  public href(query: string | IHrefQuery): string | undefined {
    const href = this.routerProvider.href(query);
    if (href && this.browserProvider.useHash) {
      return "#" + href;
    }
    return href;
  }

  /**
   * Check if a route node is active.
   *
   * @param routeName
   * @param strict
   */
  public isActive(routeName: string | IHrefQuery, strict: boolean = false): boolean {

    const href = this.routerProvider.href(routeName);
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
