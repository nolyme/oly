import { Exception, inject, Kernel } from "oly-core";
import { IHrefQuery, IMatch, ITransition } from "../interfaces";
import { Browser } from "./Browser";
import { ReactRouterProvider } from "./ReactRouterProvider";

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
   * ```typescript
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
    return this.routerProvider.href(query);
  }

  /**
   * Check if a route node is active.
   *
   * @param routeName
   */
  public isActive(routeName: string | IHrefQuery): boolean {
    const href = this.routerProvider.href(routeName);
    return this.current.path === href;
  }
}
