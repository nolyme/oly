import { Location, LocationDescriptorObject } from "history";
import { InjectedRouter } from "react-router";

/**
 * TODO: make your own router
 * - navigate should returns Promise
 *  -> break on wrong resolve
 *  -> finish on transition end
 */
export class Router {

  /**
   *
   */
  public history: InjectedRouter;

  /**
   *
   * @return {any}
   */
  public get current(): Location {
    this.checkIfReady();
    return this.history["location"]; // tslint:disable-line
  }

  /**
   *
   * @param url
   * @param replace
   */
  public navigate(url: string | LocationDescriptorObject, replace = false): void {
    this.checkIfReady();
    if (replace) {
      this.history.replace(url);
    } else {
      this.history.push(url);
    }
  }

  /**
   *
   * @param url
   */
  public replace(url: string | LocationDescriptorObject): void {
    this.navigate(url, true);
  }

  /**
   *
   */
  public back(): void {
    this.checkIfReady();
    this.history.goBack();
  }

  /**
   *
   */
  public forward(): void {
    this.checkIfReady();
    this.history.goForward();
  }

  /**
   *
   * @param url
   * @param strict
   * @return {boolean}
   */
  public isActive(url: string, strict = false): boolean {
    this.checkIfReady();
    return this.history.isActive(url, strict);
  }

  /**
   *
   */
  private checkIfReady() {
    if (!this.history) {
      throw new Error("Router is not available outside react context");
    }
  }
}
