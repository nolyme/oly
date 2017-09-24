import { env, Global, inject, Kernel, Logger, state } from "oly";
import { ICookieOptions } from "../interfaces";
import { Cookies } from "./Cookies";

/**
 * Preferences and Identifier available Browser/Server side with Cookies.
 *
 * ```ts
 * const session = k.get(PixieSession);
 * ```
 *
 * - Preferences is a object of key/value.
 *   - Store public user preferences only.
 *
 * - Identity is a string.
 *   - Store a token/sessionId with httpOnly when possible (server-side only).
 */
export class PixieSession {

  @env("PIXIE_SESSION_IDENTIFIER")
  public readonly identityCookieName: string = "PXI";

  @env("PIXIE_SESSION_PREFERENCES")
  public readonly preferencesCookieName: string = "PREF";

  @env("PIXIE_SESSION_COOKIE")
  public readonly cookieOptions: ICookieOptions = {};

  @state
  private identity: string | undefined;

  @state
  private preferences: { [key: string]: any } | undefined;

  @inject
  private cookies: Cookies;

  @inject
  private logger: Logger;

  @inject
  private kernel: Kernel;

  /**
   * Get a preference.
   *
   * ```ts
   * const session = k.get(PixieSession);
   * session.get("MyPref");
   * ```
   *
   * @param {string} key
   * @returns {string}
   */
  public get(key: string): string | undefined {

    const preferences = this.cookies.get(this.preferencesCookieName);
    if (!this.preferences && !!preferences) {
      try {
        this.preferences = JSON.parse(Global.decodeBase64(preferences));
      } catch (e) {
        this.cookies.set(this.preferencesCookieName, undefined);
      }
    } else if (!!this.preferences && !this.cookies.get(this.preferencesCookieName)) {
      this.cookies.set(this.preferencesCookieName, undefined);
    }

    if (typeof this.preferences !== "object") {
      return;
    }

    return this.preferences[key];
  }

  /**
   * Get the current identity.
   */
  public getIdentity(): string | undefined {

    if (!this.identity && !!this.cookies.get(this.identityCookieName)) {
      this.identity = this.cookies.get(this.identityCookieName);
    } else if (!!this.identity && !this.cookies.get(this.identityCookieName)) {
      this.removeIdentity();
    }

    return this.identity;
  }

  /**
   * Set a key/value.
   *
   * @param {string} key
   * @param value
   * @param {ICookieOptions} cookieOptions
   */
  public put(key: string, value: any, cookieOptions: ICookieOptions = {}) {
    this.logger.debug(`set pref '${key}'`, {value});

    const preferences = {
      ...this.preferences,
      [key]: value,
    };

    this.cookies.set(
      this.preferencesCookieName,
      Global.encodeBase64(JSON.stringify(preferences)),
      Global.merge(this.cookieOptions, cookieOptions));

    this.preferences = preferences;
  }

  /**
   * Put an identity.
   *
   * @param {string} identity
   * @param {ICookieOptions} cookieOptions
   */
  public putIdentity(identity: string, cookieOptions: ICookieOptions = {}) {
    this.logger.debug(`set identity`, {identity});

    this.cookies.set(this.identityCookieName, identity, Global.merge(this.cookieOptions, cookieOptions));
    this.identity = identity;
  }

  /**
   * Remove a pref.
   *
   * @param {string} key
   */
  public remove(key: string) {
    this.logger.debug(`remove ${key}`);

    const preferences = {
      ...this.preferences,
    };

    delete preferences[key];

    const keys = Object.keys(preferences);

    if (keys.length > 0) {
      this.cookies.set(this.preferencesCookieName, Global.encodeBase64(JSON.stringify(this.preferences)));
      this.preferences = preferences;
    } else {
      this.cookies.set(this.preferencesCookieName, undefined);
      this.preferences = undefined;
    }
  }

  /**
   * Remove identity.
   */
  public removeIdentity() {
    this.logger.debug("remove identity cookie");

    this.cookies.set(this.identityCookieName, undefined);

    this.identity = undefined;
  }
}
