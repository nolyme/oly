import * as JsCookies from "js-cookie";
import { Exception, Global, inject, Kernel } from "oly";
import { IKoaContext } from "oly-http";

export class Cookies {

  @inject
  protected kernel: Kernel;

  public get(cookieName: string): string | undefined {

    if (Global.isBrowser()) {
      return JsCookies.get(cookieName);
    }

    const ctx: IKoaContext = this.kernel.state("Koa.context");
    if (ctx) {
      return ctx.cookies.get(cookieName);
    }

    throw new Exception("There is no cookies provider for node env");
  }

  public set(cookieName: string, cookieValue?: any, options: any = {}): void {

    if (Global.isBrowser()) {
      if (typeof cookieValue === "undefined") {
        JsCookies.remove(cookieName);
      } else {
        JsCookies.set(cookieName, cookieValue, options);
      }
      return;
    }

    const ctx: IKoaContext = this.kernel.state("Koa.context");
    if (ctx) {
      ctx.cookies.set(cookieName, cookieValue, options);
      return;
    }

    throw new Exception("There is no cookies provider for the current node env");
  }
}
