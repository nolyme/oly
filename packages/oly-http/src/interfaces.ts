import { AxiosRequestConfig, AxiosResponse } from "axios";
import * as Koa from "koa";
import { IAnyFunction, Kernel } from "oly-core";
import { ZlibOptions } from "zlib";

/**
 * Override default koa context.
 * But, it's better to use IKoaContext.
 */
declare module "koa" {
  interface Context { // tslint:disable-line
    kernel: Kernel;
  }
}

export interface IKoaRequest extends Koa.Request { // tslint:disable-line
}

export interface IKoaResponse extends Koa.Response { // tslint:disable-line
}

/**
 * Koa context with oly kernel.
 */
export interface IKoaContext extends Koa.Context {
  kernel: Kernel;
  request: IKoaRequest;
  response: IKoaResponse;
}

/**
 * Middleware with our Koa.Context
 */
export type IKoaMiddleware = (ctx: IKoaContext, next: () => Promise<void>) => any;

/**
 * https://github.com/koajs/static
 */
export interface IServeOptions {
  // Default file name, defaults to 'index.html'
  index?: boolean | string;
  // If true, serves after return next(),allowing any downstream middleware to respond first.
  defer?: boolean;
  // Browser cache max-age in milliseconds. defaults to 0.
  maxage?: number;
  // Allow transfer of hidden files. defaults to false
  hidden?: boolean;
  // Try to serve the gzipped version of a file automatically when gzip is supported
  // by a client and if the requested file with .gz extension exists. defaults to true.
  gzip?: boolean;
}

/**
 * https://github.com/koajs/compress
 */
export interface ICompressOptions extends ZlibOptions {
  // An optional function that checks the response content type to decide whether to compress.
  // By default, it uses compressible.
  filter?: (contentType: string) => boolean;
  // Minimum response size in bytes to compress. Default 1024 bytes or 1kb.
  threshold?: number;
}

/**
 * https://github.com/koajs/cors
 */
export interface ICorsOptions {
  // `Access-Control-Allow-Origin`, default is '*'
  origin?: string | IAnyFunction;
  // `Access-Control-Allow-Methods`, default is 'GET,HEAD,PUT,POST,DELETE,PATCH'
  allowMethods?: string | string[];
  // `Access-Control-Expose-Headers`
  exposeHeaders?: string | string[];
  // `Access-Control-Allow-Headers`
  allowHeaders?: string | string[];
  // `Access-Control-Max-Age` in seconds
  maxAge?: string | number;
  // `Access-Control-Allow-Credentials`
  credentials?: boolean;
  //  Add set headers to `err.header` if an error is thrown
  keepHeadersOnError?: boolean;
}

/**
 * Wrap AxiosResponse with template.
 * Add template.
 * @alias
 */
export interface IHttpResponse<T> extends AxiosResponse {
  data: T;
}

/**
 * Wrap AxiosRequest.
 * @alias
 */
export type IHttpRequest = AxiosRequestConfig;
