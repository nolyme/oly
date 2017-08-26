import { Class, IMetadata } from "oly";

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

/**
 *
 */
export type IMethods = "GET" | "POST" | "DEL" | "PUT" | "PATCH";

/**
 *
 */
export interface IRouterTarget {
  prefix: string;
}

/**
 *
 */
export interface IRouterProperty {
  method: IMethods;
  path: string;
  middlewares: Function[];
  api: any;
  roles: string[];
}

/**
 *
 */
export interface IRouterArgument {
  kind: "param" | "query" | "header" | "body" | "file";
  type: Class;
  name: string;
}

/**
 *
 */
export interface IRouterMetadata extends IMetadata {
  target: IRouterTarget;
  properties: {
    [key: string]: IRouterProperty;
  };
  args: {
    [key: string]: IRouterArgument[];
  };
}
