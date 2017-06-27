import * as JsCookies from "js-cookie";
import { Exception, Global, inject, Kernel } from "oly-core";
import { IKoaContext } from "oly-http";

export class Cookies {

  @inject
  public kernel: Kernel;

  public get(cookieName: string): string {

    if (Global.isBrowser()) {
      return JsCookies.get(cookieName);
    }

    const ctx: IKoaContext = this.kernel.state("Koa.context");
    if (ctx) {
      return ctx.cookies.get(cookieName);
    }

    throw new Exception("There is no cookies provider for node env");
  }

  public set(cookieName: string, cookieValue: any): void {

    if (Global.isBrowser()) {
      JsCookies.set(cookieName, cookieValue);
      return;
    }

    const ctx: IKoaContext = this.kernel.state("Koa.context");
    if (ctx) {
      ctx.cookies.set(cookieName, cookieValue);
      return;
    }

    throw new Exception("There is no cookies provider for node env");
  }
}
