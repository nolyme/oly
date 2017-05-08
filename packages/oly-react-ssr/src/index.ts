/**
 * Configuration.
 */
declare module "oly-core/lib/env" {
  interface IEnv {

    /**
     * ID of the DOM targeted for rendering.
     * It's a string, not a HTMLElement.
     *
     * @target ReactServerProvider
     */
    OLY_REACT_ID?: string;

    /**
     * One or many of:
     * - URL to static react website
     * It can be 'http://localhost:8080' if you use webpack-dev-server
     * or even 'https://mywebapp.com'
     * - Local directory of static react content.
     * - "default", a default template will be generated
     * - "<html... >"
     */
    OLY_REACT_SERVER_POINTS?: string | string[];

    /**
     * The prefix router path.
     */
    OLY_REACT_SERVER_PREFIX?: string;

    /**
     * The base url of pixie http client.
     */
    OLY_PIXIE_HTTP_ROOT?: string;

    /**
     *
     */
    OLY_PIXIE_COOKIE?: string;

    /**
     *
     */
    OLY_PIXIE_COOKIE_OPTIONS?: string;
  }
}

export * from "./server";
export * from "./pixie";
export * from "./helmet";
