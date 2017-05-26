import { HrefOptions, TransitionOptions } from "@uirouter/core";
import { inject } from "oly-core";
import { IRouteState } from "../interfaces";
import { RouterProvider } from "./RouterProvider";

export class Router {

  @inject(RouterProvider)
  protected routerProvider: RouterProvider;

  /**
   * Get the current route state definition.
   */
  public get current(): IRouteState {
    if (this.routerProvider.uiRouter.stateService.transition) {
      return this.routerProvider.uiRouter.stateService.transition.$to();
    }
    return this.routerProvider.uiRouter.stateService.$current;
  }

  /**
   * Get the current route parameters (path+query).
   */
  public get params(): { [key: string]: string } {
    if (this.routerProvider.uiRouter.stateService.transition) {
      return this.routerProvider.uiRouter.stateService.transition.injector().get("$stateParams");
    }
    return this.routerProvider.uiRouter.stateService.params;
  }

  /**
   * Go to a named state.
   *
   * @param routeName   Route state
   * @param params      Parameters
   * @param options     UIRouter go options
   */
  public go(routeName: string, params: object = {}, options: TransitionOptions = {}): Promise<IRouteState> {
    if (routeName[0] === "/") {
      throw new Error("Go requires a routeName, not an url");
    }
    return this.routerProvider.uiRouter.stateService.go(routeName, params, options);
  }

  /**
   * Get the path of a route state.
   *
   * @param routeName   Route state
   * @param params      Parameters
   * @param options     UIRouter go options
   */
  public path(routeName: string, params: object = {}, options: HrefOptions = {}): string {
    return this.routerProvider.uiRouter.stateService.href(routeName, params, options);
  }

  /**
   * Check if a route state is active.
   *
   * @param routeName
   */
  public isActive(routeName: string | IRouteState): boolean {
    return this.current.includes[typeof routeName === "string" ? routeName : routeName.name];
  }
}
