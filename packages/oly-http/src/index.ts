/**
 * Configuration.
 */
declare module "oly-core/lib/env" {
  interface IEnv {
    /**
     * Set the http server host. (e.g localhost, 0.0.0.0, my.domain.com)
     */
    OLY_HTTP_SERVER_HOST?: string;
    /**
     * Set the http server port.
     */
    OLY_HTTP_SERVER_PORT?: number;
  }
}

export * from "./index.browser";
export * from "./interfaces";
export * from "./middlewares";
export * from "./providers/HttpServerProvider";
export * from "./configuration";
