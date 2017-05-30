import { HrefOptions, TransitionOptions } from "@uirouter/core";
import { _, inject, Kernel } from "oly-core";
import { olyReactEvents } from "../constants/events";
import { IRouteState } from "../interfaces";
import { ReactRouterProvider } from "./ReactRouterProvider";

export class Router {

  @inject(Kernel)
  protected kernel: Kernel;

  @inject(ReactRouterProvider)
  protected routerProvider: ReactRouterProvider;

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
   * ```typescript
   * router.go("index");
   * ```
   *
   * @param routeName   Route state
   * @param params      Parameters
   * @param options     UIRouter go options
   */
  public go(routeName: string, params: object = {}, options: TransitionOptions = {}): Promise<void> {
    if (routeName[0] === "/") {
      throw new Error("Go requires a routeName, not an url");
    }
    return this.routerProvider.uiRouter.stateService.go(routeName, params, options).then(() => {
      return this.kernel.on(olyReactEvents.TRANSITION_END, _.noop).wait();
    });
  }

  /**
   * Reload state
   */
  public reload(): Promise<void> {
    return this.routerProvider.uiRouter.stateService.reload().then(() => {
      return this.kernel.on(olyReactEvents.TRANSITION_END, _.noop).wait();
    });
  }

  /**
   * Get the path of a route state.
   *
   * @param routeName   Route state
   * @param params      Parameters
   * @param options     UIRouter go options
   */
  public href(routeName: string, params: object = {}, options: HrefOptions = {}): string {
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
