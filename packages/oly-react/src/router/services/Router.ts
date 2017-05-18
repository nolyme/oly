import { Location, LocationDescriptorObject } from "history";
import { _, inject, Kernel } from "oly-core";
import { TRANSITION_FINISH } from "../constants";
import { Browser } from "./Browser";

/**
 *
 */
export class Router {

  @inject(Browser)
  protected browser: Browser;

  @inject(Kernel)
  protected kernel: Kernel;

  /**
   *
   * @return {any}
   */
  public get current(): Location {
    return this.browser.history.getCurrentLocation();
  }

  /**
   *
   * @param url
   * @param replace
   */
  public navigate(url: string | LocationDescriptorObject, replace = false): Promise<void> {
    if (replace) {
      this.browser.history.replace(url);
    } else {
      this.browser.history.push(url);
    }
    return this.kernel.on(TRANSITION_FINISH, _.noop).wait();
  }

  /**
   *
   * @param url
   */
  public replace(url: string | LocationDescriptorObject): Promise<void> {
    return this.navigate(url, true);
  }

  /**
   *
   */
  public back(): void {
    this.browser.history.goBack();
  }

  /**
   *
   */
  public forward(): void {
    this.browser.history.goForward();
  }
}
