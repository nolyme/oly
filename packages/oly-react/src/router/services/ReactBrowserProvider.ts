import { createBrowserHistory, createHashHistory } from "history";
import { env, inject, IProvider, Kernel, Logger, on } from "oly-core";
import { createElement } from "react";
import { AppContext } from "../../core/components/AppContext";
import { View } from "../components/View";
import { olyReactRouterEvents } from "../constants/events";
import { ITransition, ITransitionType } from "../interfaces";
import { Browser } from "./Browser";
import { ReactRouterProvider } from "./ReactRouterProvider";

/**
 *
 */
export class ReactBrowserProvider implements IProvider {

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

  @inject
  protected kernel: Kernel;

  @inject
  protected logger: Logger;

  @inject
  protected browser: Browser;

  @inject
  protected router: ReactRouterProvider;

  /**
   * Hook - start
   */
  public onStart(): Promise<void> {

    this.createHistory();

    this.browser.history.block(((location: any, action: ITransitionType) => {
      if (action === "POP") {
        return location.pathname;
      }
    }) as any);

    return this.router.transition({
      to: this.browser.history.location.pathname,
      type: "NONE",
    }).then(() => {
      this.logger.info("render react view");
      this.mount();
    });
  }

  @on(olyReactRouterEvents.TRANSITION_END)
  protected onTransitionEnd(transition: ITransition) {
    if (transition.type === "PUSH") {
      this.browser.history.push(transition.to.path);
    } else if (transition.type === "REPLACE") {
      this.browser.history.replace(transition.to.path);
    }
  }

  protected createHistory() {
    if (this.useHash) {
      this.browser.history = createHashHistory({
        getUserConfirmation: this.createHistoryInterceptor(),
      });
    } else {
      this.browser.history = createBrowserHistory({
        getUserConfirmation: this.createHistoryInterceptor(),
      });
    }
  }

  protected createHistoryInterceptor() {
    return (message: string, callback: Function) => {
      if (message) {
        this.router.transition({
          to: message,
          type: "POP",
        }).then(() => {
          callback(true);
        }).catch(() => {
          callback(false);
        });
      }
    };
  }

  /**
   * Mount the app.
   */
  protected mount(): void {
    this.browser.render(this.rootElement, this.mountId);
  }

  /**
   *
   */
  public get rootElement(): JSX.Element {
    return createElement(AppContext, {kernel: this.kernel}, createElement(View, {index: 0}));
  }
}
