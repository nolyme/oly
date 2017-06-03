import { inject, Logger } from "oly-core";
import { Browser } from "../../router/services/Browser";
import { Pixie } from "../services/Pixie";
import { PixieHttp } from "../services/PixieHttp";
import { PixieSession } from "../services/PixieSession";

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

  /**
   *
   * @param name
   */
  public getCookie(name: string): string | undefined {

    if (!this.browser.exists()) {
      return;
    }

    const value = "; " + this.browser.window.document.cookie;
    const parts = value.split("; " + name + "=");
    if (parts.length === 2) {
      return parts[parts.length - 1].split(";").shift();
    }

    return undefined;
  }

  /**
   *
   */
  protected onStart(): void {

    const data = this.browser.window[Pixie.stateName];
    if (!!data) {
      this.logger.debug("feed a pixie with", data);
      (this.pixie as any).data = data;
    }

    const token = this.pixie.get<string>(this.session.cookieName);
    if (!!token) {
      (this.session as any).token = token;
    } else {
      const cookie = this.getCookie(this.session.cookieName);
      if (!!cookie) {
        (this.session as any).token = cookie;
      }
    }
  }
}
