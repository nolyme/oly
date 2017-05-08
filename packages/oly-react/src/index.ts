/**
 * Configuration.
 */
declare module "oly-core/lib/env" {
  interface IEnv {

    /**
     * ID of the DOM targeted for rendering.
     * It's a string, not a HTMLElement.
     *
     * @target ReactBrowserProvider
     */
    OLY_REACT_ID?: string;
  }
}

export * from "./core";
export * from "./router";
