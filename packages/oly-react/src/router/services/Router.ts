import { Exception, inject, Kernel } from "oly-core";
import { IHrefQuery, IMatch, IRoute, ITransition } from "../interfaces";
import { ReactRouterProvider } from "./ReactRouterProvider";

export class Router {

  @inject
  protected kernel: Kernel;

  @inject
  protected routerProvider: ReactRouterProvider;

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
    return this.go(this.current.path);
  }

  /**
   * Get the path of a route node.
   *
   * @param query
   */
  public href(query: string | IHrefQuery): string {
    return this.routerProvider.href(query);
  }

  /**
   * Check if a route node is active.
   *
   * @param routeName
   */
  public isActive(routeName: string | IRoute): boolean {
    return false; // TODO
  }
}
