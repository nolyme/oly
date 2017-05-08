import { request } from "http";
import { KoaMiddleware } from "oly-http";
import { Url } from "url";

/**
 * Very basic proxy koa middleware.
 *
 * @param url
 */
export const proxy = (url: Url): KoaMiddleware => (ctx, next) => {

  if (!!ctx.req.url && ctx.req.url.indexOf(".") > -1) {
    return new Promise((resolve) => {
      request({
        headers: ctx.req.headers,
        hostname: url.hostname,
        method: ctx.req.method,
        path: ctx.req.url,
        port: Number(url.port) || (url.protocol === "https" ? 443 : 80),
        protocol: url.protocol,
      }, (res) => {
        ctx.body = res;
        ctx.status = res.statusCode || 500;
        for (const name of Object.keys(res.headers)) {
          if (name === "transfer-encoding") {
            continue;
          }
          ctx.set(name, res.headers[name]);
        }
        resolve();
      }).end();
    });
  }

  return next();
};
