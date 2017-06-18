import { createBrowserHistory, createHashHistory } from "history";
import { env, inject, IProvider, Kernel, Logger, on } from "oly-core";
import { createElement } from "react";
import { AppContext } from "../../core/components/AppContext";
import { View } from "../components/View";
import { olyReactRouterEvents } from "../constants/events";
import { ITransitionRenderEvent, ITransitionType } from "../interfaces";
import { Browser } from "../services/Browser";
import { Router } from "../services/Router";

/**
 *
 */
export class ReactBrowserProvider implements IProvider {

  /**
   *
   */
  @env("REACT_ID")
  public readonly mountId: string = "app";

  /**
   *
   */
  @env("REACT_ROUTER_HASH")
  public readonly useHash: boolean = false;

  @inject
  protected kernel: Kernel;

  @inject
  protected logger: Logger;

  @inject
  protected browser: Browser;

  @inject
  protected router: Router;

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

    return this.router.go({
      to: this.browser.history.location.pathname,
      type: "NONE",
    }).then(() => {
      this.logger.info("render react view");
      this.mount();
    });
  }

  /**
   * Each time the ReactRouterProvider requests a render, we update the history.
   */
  @on(olyReactRouterEvents.TRANSITION_RENDER)
  protected onTransitionEnd({transition}: ITransitionRenderEvent) {
    if (transition.type === "PUSH") {
      this.logger.trace(`push '${transition.to.path}' history`);
      this.browser.history.push(transition.to.path);
    } else if (transition.type === "REPLACE") {
      this.logger.trace(`replace '${transition.to.path}' history`);
      this.browser.history.replace(transition.to.path);
    }
  }

  /**
   *
   */
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

  /**
   *
   */
  protected createHistoryInterceptor() {
    return (message: string, callback: Function) => {
      if (message) {
        this.logger.trace(`intercept history ${message}`);
        this.router.go({
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
   * Create JSX root element.
   */
  public get rootElement(): JSX.Element {
    return createElement(AppContext, {kernel: this.kernel}, createElement(View, {index: 0}));
  }
}
