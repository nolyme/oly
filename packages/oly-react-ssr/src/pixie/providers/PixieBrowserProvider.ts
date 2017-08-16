import { inject, Logger } from "oly-core";
import { Browser, ReactBrowserProvider } from "oly-react";
import { Cookies } from "../../server/services/Cookies";
import { Pixie } from "../services/Pixie";
import { PixieHttp } from "../services/PixieHttp";
import { PixieSession } from "../services/PixieSession";
import { AutoPixieHttpProvider } from "./AutoPixieHttpProvider";

export class PixieBrowserProvider {

  @inject
  protected logger: Logger;

  @inject
  protected pixie: Pixie;

  @inject
  protected http: PixieHttp;

  @inject
  protected session: PixieSession;

  @inject
  protected browser: Browser;

  @inject
  protected cookies: Cookies;

  @inject
  protected autoPixieHttpProvider: AutoPixieHttpProvider;

  @inject
  protected reactBrowserProvider: ReactBrowserProvider;

  /**
   *
   */
  protected onConfigure(): void {

    const data = this.browser.window[Pixie.stateName];
    if (!!data) {
      this.logger.debug("feed a pixie with", data);
      (this.pixie as any).data = data;
    }

    // useless now
    // const token = this.pixie.get<string>(this.session.cookieName);
    // if (!!token) {
    //   (this.session as any).token = token;
    // } else {
    //   const cookie = this.cookies.get(this.session.cookieName);
    //   if (!!cookie) {
    //     (this.session as any).token = cookie;
    //   }
    // }
  }
}
