import { inject, Logger } from "oly-core";
import * as React from "react";
import * as ReactDOM from "react-dom";

/**
 *
 */
export class Browser {

  @inject(Logger)
  protected logger: Logger;

  /**
   *
   */
  protected container: HTMLElement | null;

  /**
   *
   */
  public get window(): Window {
    if (!this.exists()) {
      throw new Error("There is no DOM env here");
    }
    return window;
  }

  /**
   *
   */
  public get document(): Document {
    return this.window.document;
  }

  /**
   *
   */
  public get root(): HTMLElement {
    if (!this.container) {
      throw new Error("There is no container yet, maybe you should call #render() before");
    }
    return this.container;
  }

  /**
   *
   */
  public exists(): boolean {
    return typeof window !== "undefined"
      && typeof document !== "undefined";
  }

  /**
   *
   * @param element
   * @param mountId
   */
  public render(element: React.ReactElement<any>, mountId: string): void {

    this.container = this.window.document.getElementById(mountId);
    if (!this.container) {
      this.logger.warn(`No element with id="${mountId}" was found. You can use REACT_ID for changing the mount id.`);
      this.container = document.createElement("div");
      this.container.setAttribute("id", mountId);
      document.body.appendChild(this.container);
    }

    ReactDOM.render(element, this.container);
  }
}
