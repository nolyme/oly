import { env, inject, Logger, state } from "oly-core";
import { Browser } from "oly-react";
import { Cookies } from "../../server/services/Cookies";
import { olyReactPixieStates } from "../constants/states";
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
  public cookieName: string = "TK";

  @inject
  protected pixie: Pixie;

  @inject
  protected browser: Browser;

  @inject
  protected logger: Logger;

  @inject
  protected cookies: Cookies;

  @state(olyReactPixieStates.PIXIE_SESSION_TOKEN)
  protected token: string | null;

  /**
   * Check if token exists.
   */
  public hasToken(): boolean {
    return !!this.getToken();
  }

  /**
   * Get in-memory token.
   */
  public getToken(): string | null {

    if (!this.token && this.cookies.get(this.cookieName)) {
      this.token = this.cookies.get(this.cookieName);
    }

    return this.token;
  }

  /**
   * Attach token/session on Cookie.
   *
   * @param token    SessionId or JWT
   * @param ttl      Cookie lifetime in second
   */
  public setToken(token: string, ttl?: number): void {
    this.logger.info("set token");

    this.cookies.set(this.cookieName, token, {
      path: "/",
      httpOnly: false,
      expires: ttl ? new Date(new Date().getTime() + ttl * 1000) : undefined,
    });

    this.token = token;
  }

  /**
   * Delete token. Remove from cookie.
   */
  public removeToken(): void {
    this.logger.info("remove token");

    this.cookies.set(this.cookieName, undefined);

    this.token = null;
  }
}
