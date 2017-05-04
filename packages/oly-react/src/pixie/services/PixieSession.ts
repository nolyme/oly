import { env, inject, Logger } from "oly-core";
import { Pixie } from "./Pixie";

/**
 *
 */
export class PixieSession {

  @env("OLY_PIXIE_COOKIE")
  public cookieName: string = "SSID";

  @inject(Pixie)
  protected pixie: Pixie;

  @inject(Logger)
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

    if (this.pixie.isBrowser()) {

      const path = "Path=/;";
      const expires = ttl
        ? `expires=${new Date(new Date().getTime() + ttl * 1000).toUTCString()};`
        : "";

      this.logger.info(`set cookie: ${this.cookieName}=${this.token};` + path + expires);
      window.document.cookie = `${this.cookieName}=${this.token};` + path + expires;
    }
  }

  /**
   *
   */
  public removeToken(): void {
    this.token = null;
    if (this.pixie.isBrowser()) {
      this.logger.info("remove cookie");
      window.document.cookie = `${this.cookieName}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    }
  }
}
