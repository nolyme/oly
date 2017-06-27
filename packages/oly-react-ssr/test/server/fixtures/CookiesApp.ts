import { inject } from "oly-core";
import { page, param } from "oly-react";
import { Cookies } from "../../../src/server/services/Cookies";

export class CookiesApp {

  @inject cookies: Cookies;

  @page home() {
    return "OK:" + this.cookies.get("a");
  }

  @page("/set/:value") setCookie(@param value: string) {
    this.cookies.set("a", value);
    return this.home();
  }
}
