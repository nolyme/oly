import * as H from "history";
import { inject, Logger } from "oly-core";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { browserHistory } from "react-router";

/**
 *
 */
export class Browser {

  public history: H.History = browserHistory;

  protected container: HTMLElement | null;

  @inject(Logger)
  protected logger: Logger;

  public get window(): Window {
    return window;
  }

  public get document(): Document {
    return document;
  }

  public get root(): HTMLElement {
    if (!this.container) {
      throw new Error("You should probably call #render() before use .root");
    }
    return this.container;
  }

  public exists(): boolean {
    return typeof window !== "undefined"
      && typeof document !== "undefined";
  }

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
