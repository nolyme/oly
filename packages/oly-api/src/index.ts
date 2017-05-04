/**
 *
 */
declare module "oly-core/lib/env" {
  interface IEnv {
    /**
     * Set a global prefix for api routing.
     * Sometimes, you will use '/api'.
     */
    OLY_API_PREFIX?: string;
  }
}

export * from "./constants";
export * from "./interfaces";
export * from "./services/KoaRouterBuilder";
export * from "./decorators/arg";
export * from "./decorators/body";
export * from "./decorators/del";
export * from "./decorators/get";
export * from "./decorators/path";
export * from "./decorators/post";
export * from "./decorators/put";
export * from "./decorators/route";
export * from "./decorators/router";
export * from "./decorators/query";
export * from "./decorators/use";
export * from "./decorators/upload";
export * from "./middlewares/end";
export * from "./middlewares/root";
export * from "./providers/ApiProvider";
export * from "./utils/KoaRouterUtil";
export * from "./hal/Link";
export * from "./hal/Resource";

