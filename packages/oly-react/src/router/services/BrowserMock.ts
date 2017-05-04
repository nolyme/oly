import { History } from "history";
import createMemoryHistory from "history/lib/createMemoryHistory";
import { inject, injectable, Kernel } from "oly-core";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ReactBrowserProvider } from "../providers/ReactBrowserProvider";
import { Browser } from "./Browser";

/**
 * Basic browser renderer mocking
 */
@injectable({
  provide: Browser,
})
export class BrowserMock extends Browser {

  public html = "";

  public data = {};

  public history: History = createMemoryHistory();

  @inject(Kernel)
  protected kernel: Kernel;

  public get window(): any {
    return this.data;
  }

  public render(element: React.ReactElement<any>, mountId: string) {
    this.html = renderToStaticMarkup(element);
  }

  public async open(url: string) {
    this.history = createMemoryHistory();
    this.history.push(url);
    await this.kernel.get(ReactBrowserProvider).mount();
  }
}
