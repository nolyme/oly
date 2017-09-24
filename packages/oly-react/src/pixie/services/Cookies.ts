import * as JsCookies from "js-cookie";
import { Exception, Global, inject, Kernel } from "oly";
import { IKoaContext } from "oly-http";
import { olyReactPixieErrors } from "../constants/errors";
import { ICookieOptions } from "../interfaces";

/**
 * Read/Write cookies Browser/Server side.
 */
export class Cookies {

  @inject
  protected kernel: Kernel;

  /**
   * Get a cookiie.
   *
   * @param {string} cookieName
   * @returns {string}
   */
  public get(cookieName: string): string | undefined {

    if (Global.isBrowser()) {
      return JsCookies.get(cookieName);
    }

    const ctx: IKoaContext = this.kernel.state("Koa.context");
    if (ctx) {
      return ctx.cookies.get(cookieName);
    }
  }

  /**
   * Set a cookie.
   *
   * @param {string} cookieName
   * @param cookieValue
   * @param {ICookieOptions} options
   */
  public set(cookieName: string, cookieValue?: any, options: ICookieOptions = {}): void {

    if (Global.isBrowser()) {

      // js-cookie

      if (typeof cookieValue === "undefined") {
        JsCookies.remove(cookieName);
      } else {

        if (typeof options.secure === "undefined") {
          options.secure = location.protocol === "https:";
        }

        JsCookies.set(cookieName, cookieValue, options);
      }

      return;
    }

    const ctx: IKoaContext = this.kernel.state("Koa.context");
    if (ctx) {

      // koa cookie

      ctx.cookies.set(cookieName, cookieValue, this.toKoaOptions(options));
      return;
    }

    throw new Exception(olyReactPixieErrors.noCookieHere());
  }

  /**
   * Transform JS-Cookie options to Koa options.
   */
  protected toKoaOptions(options: ICookieOptions) {
    return options;
  }
}
