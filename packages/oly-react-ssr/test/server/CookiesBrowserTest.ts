/**
 * @jest-environment jsdom
 */

import { Kernel } from "oly-core";
import { ReactBrowserProvider, Router } from "oly-react";
import { Cookies } from "../../src/server/services/Cookies";
import { CookiesApp } from "./fixtures/CookiesApp";

describe("Cookies", () => {

  const kernel = Kernel.create().with(CookiesApp, ReactBrowserProvider);
  const router = kernel.inject(Router);
  const cookies = kernel.inject(Cookies);

  it("should be ok with browser", async () => {

    expect(window.document.cookie).toBe("");
    expect(window.document.body.textContent).toBe("OK:undefined");
    cookies.set("a", "b");
    await router.reload();
    expect(window.document.body.textContent).toBe("OK:b");
    await router.go("/set/abc");
    expect(window.document.body.textContent).toBe("OK:abc");
  });
});
