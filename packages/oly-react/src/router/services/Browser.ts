import * as H from "history";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { browserHistory } from "react-router";

/**
 *
 */
export class Browser {

  public history: H.History = browserHistory;

  public exists() {
    return typeof window !== "undefined";
  }

  public get window(): Window {
    return window;
  }

  public render(element: React.ReactElement<any>, mountId: string): void {

    const mountElement = this.window.document.getElementById(mountId);
    if (!mountElement) {
      throw new Error(`No element with id="${mountId}" was found. You can use REACT_ID for changing the mount id.`);
    }

    ReactDOM.render(element, mountElement);
  }
}
