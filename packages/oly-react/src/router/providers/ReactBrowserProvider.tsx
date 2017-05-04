import { History, Location } from "history";
import { env, IDeclarations, inject, Kernel, state } from "oly-core";
import * as React from "react";
import { match, RouteConfig, Router as RouterComponent, RouterState } from "react-router";
import { AppContext } from "../../core/components/AppContext";
import { Browser } from "../services/Browser";
import { RouterBuilder } from "../services/RouterBuilder";

/**
 * Render react app in a browser.
 */
export class ReactBrowserProvider {

  /**
   * @see {IEnv.OLY_REACT_ID}
   * @type {string}
   */
  @env("OLY_REACT_ID")
  public mountId: string = "app";

  @inject(Kernel)
  protected kernel: Kernel;

  @inject(Browser)
  protected browser: Browser;

  @inject(RouterBuilder)
  protected routerBuilder: RouterBuilder;

  /**
   * Routes are created on startup, then cached here.
   */
  @state()
  protected routes: RouteConfig;

  /**
   * This will resolve the current route then start react rendering.
   * Mount is called by onStart automatically but can be manually used for re-rendering.
   */
  public mount(): Promise<void> {

    return this.match(this.browser.history, this.routes).then(({redirectLocation, nextState}) => {

      if (redirectLocation) {
        return this.browser.history.push(redirectLocation);
      }

      if (!nextState) {
        this.browser.render((<div>{"The page you are looking for can't be found."}</div>), this.mountId);
        throw new Error(`No routes was found for current url. Please, use @page('**') for a better 404 handler`);
      }

      return this.render(nextState);
    });
  }

  /**
   * Hook - start
   *
   * @param deps  Kernel dependencies
   */
  protected onStart(deps: IDeclarations) {

    this.routes = this.routerBuilder.createRoutesFromDeps(deps, this.kernel);

    return this.mount();
  }

  /**
   * Promise react-router v3 #match().
   *
   * @param history Browser history
   * @param routes  Route configuration
   */
  protected match(history: History, routes: RouteConfig): Promise<{
    redirectLocation: Location,
    nextState: RouterState,
  }> {
    return new Promise((resolve, reject) => {
      match({history, routes}, (error, redirectLocation, nextState) => {
        if (error) {
          reject(error);
        } else {
          resolve({redirectLocation, nextState});
        }
      });
    });
  }

  /**
   * Use Browser for render a react app.
   * This function use <AppContext> for emit current kernel.
   *
   * @param routerState Current router state
   */
  protected render(routerState: RouterState) {
    return this.browser.render((
      <AppContext kernel={this.kernel}>
        <RouterComponent {...routerState as any}/>
      </AppContext>
    ), this.mountId);
  }
}
