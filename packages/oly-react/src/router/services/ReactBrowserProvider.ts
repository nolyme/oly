import { hashLocationPlugin, pushStateLocationPlugin } from "@uirouter/core";
import { env, inject, Kernel, Logger } from "oly-core";
import { createElement } from "react";
import { AppContext } from "../../core/components/AppContext";
import { View } from "../components/View";
import { Browser } from "./Browser";
import { ReactRouterProvider } from "./ReactRouterProvider";

/**
 *
 */
export class ReactBrowserProvider {

  /**
   *
   */
  @env("OLY_REACT_ID")
  public mountId: string = "app";

  /**
   *
   */
  @env("OLY_REACT_ROUTER_HASH")
  public readonly useHash: boolean = false;

  @inject(Kernel)
  protected kernel: Kernel;

  @inject(Logger)
  protected logger: Logger;

  @inject(Browser)
  protected browser: Browser;

  @inject(ReactRouterProvider)
  protected router: ReactRouterProvider;

  /**
   * Hook - start
   */
  protected onStart(): Promise<void> {

    const locationService = this.useHash
      ? hashLocationPlugin
      : pushStateLocationPlugin;

    // when you go to "/" in hash mode, there is no route
    // so we redirect "/" to "/#/"
    if (this.useHash && !this.browser.window.location.hash) {
      this.browser.window.location.hash = "#/";
    }

    return this.router.listen(locationService).then(() => {
      this.logger.info("render react view");
      this.render();
    });
  }

  /**
   * Mount the app.
   */
  protected render(): void {
    this.browser.render(this.rootElement, this.mountId);
  }

  /**
   *
   */
  public get rootElement(): JSX.Element {
    return createElement(AppContext, {kernel: this.kernel}, createElement(View));
  }
}
