import { env, Global, inject, Logger } from "oly-core";
import { Browser } from "../../router/services/Browser";
import { Pixie } from "./Pixie";

/**
 *
 */
export class PixieSession {

  @env("OLY_PIXIE_COOKIE")
  public cookieName: string = "SSID";

  @inject
  protected pixie: Pixie;

  @inject
  protected browser: Browser;

  @inject
  protected logger: Logger;

  protected token: string | null;

  /**
   *
   * @return {boolean}
   */
  public hasToken() {
    return !!this.token;
  }

  /**
   *
   * @return {string|null}
   */
  public getToken() {
    return this.token;
  }

  /**
   *
   * @param token
   * @param ttl      In second
   */
  public setToken(token: string, ttl?: number): void {

    this.token = token;

    if (Global.isBrowser()) {

      const path = "Path=/;";
      const expires = ttl
        ? `expires=${new Date(new Date().getTime() + ttl * 1000).toUTCString()};`
        : "";
      const cookie = `${this.cookieName}=${this.token};` + path + expires;

      this.logger.info(cookie);
      this.browser.window.document.cookie = cookie;
    }
  }

  /**
   *
   */
  public removeToken(): void {
    this.token = null;
    if (Global.isBrowser()) {
      this.logger.info("remove cookie");
      this.browser.window.document.cookie = `${this.cookieName}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    }
  }
}
