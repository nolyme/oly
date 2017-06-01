import { _, inject, Kernel, state } from "oly-core";
import { IKoaContext } from "oly-http";
import { AppContext, View } from "oly-react";
import * as React from "react";
import { createElement } from "react";
import { renderToString } from "react-dom/server";

export class ReactServerRenderer {

  /**
   * List of POST transformation of template.
   * You can see an example on {@see PixieServerProvider}.
   *
   * @type {Array}
   */
  @state()
  public templateTransforms: Array<(template: string, context: Kernel) => string> = [];

  @inject(Kernel)
  protected kernel: Kernel;

  /**
   * This is useless if you use ReactStatic or ReactProxy.
   *
   * @param prefix
   * @param mountId
   */
  public generateIndex(prefix: string, mountId: string) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8"/>
          <title>${this.kernel.env("OLY_APP_NAME")}</title>
          <base href="${prefix}"/>
        </head>
        <body>
          <div id="${mountId}"></div>
        </body>
      </html>
    `;
  }

  /**
   * Make the react rendering.
   *
   * @param ctx             IKoaContext
   * @param template        index.html
   * @param mountId
   */
  public render(ctx: IKoaContext, template: string, mountId: string): string {

    const markup = renderToString(this.rootElement);

    template = template.replace(
      `<div id="${mountId}"></div>`,
      `<div id="${mountId}">${markup}</div>`);

    // apply transformations
    this.templateTransforms.forEach((func) => template = func(template, ctx.kernel));

    return template;
  }

  /**
   * In very few cases, SSR can failed.
   *
   * ```
   * class MyRenderer extends ReactServerRenderer {
   *  renderError(ctx, template, id, error) {
   *    return ``; // wat u want
   *  }
   * }
   * ```
   *
   * @param ctx         Koa Context with Kernel
   * @param mountId
   * @param template    App template with styles + scripts
   * @param error       The holy error
   * @returns {string}
   */
  public renderError(ctx: IKoaContext, template: string, mountId: string, error: Error): string {
    return template.replace(/<body(.*)>[\s\S]*<\/body>/igm, `
       <body$1>
        <div style="padding: 50px">
        <strong>Looks like something went wrong!</strong>
        <div></div>
        ${
      !_.isProduction()
        ? `<pre style="overflow-x: auto; padding: 10px; font-size: 12px">${error.stack || error.message || error}</pre>`
        : ""}
        </div>
       </body>
    `);
  }

  /**
   *
   */
  public get rootElement(): JSX.Element {
    return createElement(AppContext, {kernel: this.kernel}, createElement(View, {index: 0}));
  }
}
