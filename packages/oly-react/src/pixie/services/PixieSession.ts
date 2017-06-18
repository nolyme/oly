import { env, Global, inject, Logger } from "oly-core";
import { Browser } from "../../router/services/Browser";
import { Pixie } from "./Pixie";

/**
 * Session container.
 *
 * Parse sessionId/token on Cookie.
 *
 * All the jobs are already done by PixieBrowserProvider and PixieServerProvider.
 */
export class PixieSession {

  @env("PIXIE_COOKIE")
  public cookieName: string = "SSID";

  @inject
  protected pixie: Pixie;

  @inject
  protected browser: Browser;

  @inject
  protected logger: Logger;

  protected token: string | null;

  /**
   * Check if token exists.
   */
  public hasToken(): boolean {
    return !!this.token;
  }

  /**
   * Get in-memory token.
   */
  public getToken(): string | null {
    return this.token;
  }

  /**
   * Attach token/session on Cookie.
   *
   * @param token    SessionId or JWT
   * @param ttl      Cookie lifetime in second
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
   * Delete token. Remove from cookie.
   */
  public removeToken(): void {
    this.token = null;
    if (Global.isBrowser()) {
      this.logger.info("remove cookie");
      this.browser.window.document.cookie = `${this.cookieName}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    }
  }
}
