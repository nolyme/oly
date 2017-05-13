import * as KoaRouter from "koa-router";

/**
 * @alias
 */
export type IKoaRouter = KoaRouter;

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
 * Definition of file used by multer.
 *
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
