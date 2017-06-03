import * as KoaRouter from "koa-router";

/**
 */
export type IKoaRouter = KoaRouter;

/**
 * Add koa-bodyparser and koa-router to definitions.
 */
declare module "oly-http/lib/interfaces" {

  interface IKoaRequest {
    body: any;
  }

  interface IKoaContext {
    params: { [key: string]: any };
  }
}

/**
 * Definition of file used by multer.
 */
export interface IUploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}
