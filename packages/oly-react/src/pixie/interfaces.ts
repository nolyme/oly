/**
 *
 */
export type Side = "browser" | "server" | "both";

/**
 *
 */
export interface IPixieSetOptions {
  only?: Side;
  once?: boolean;
}

export interface ICookieOptions {
  // browser + server (https://github.com/js-cookie/js-cookie)
  expires?: Date;
  domain?: string;
  path?: string;
  secure?: boolean;

  // server only (http://koajs.com/)
  httpOnly?: boolean;
  overwrite?: boolean;
}
