import * as KoaRouter from "koa-router";
import { KoaMiddleware } from "oly-http";

/**
 * @alias
 */
export type IKoaRouter = KoaRouter;

/**
 * HttpMethods allowed.
 * Note: Patch & cie are ignored.
 */
export type IMethods = "GET" | "POST" | "DEL" | "PUT" | "PATCH";

/**
 * Default error structure.
 * Override with typescript interface enhancement.
 *
 * ```ts
 * declare module "oly-api/lib/interfaces" {
 *    export interface IApiError {
 *      error: {
 *         status: number;
 *         message: string;
 *         // ...
 *      }
 *    }
 * }
 * ```
 */
export interface IApiError {
  error: {
    status: number;
    message: string;
    details?: any;
  };
}

/**
 * Router metadata options
 */
export interface IRouterOptions {
  prefix: string;
  routes: {
    [key: string]: IRoute;
  };
}

/**
 * Route metadata options
 */
export interface IRoute {
  method: IMethods;
  path: string;
  middlewares: KoaMiddleware[];
  args: {
    [key: number]: {
      body?: any;
      query?: string;
      path?: string;
    },
  };
}

/**
 * @experimental
 */
export interface IUploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}
