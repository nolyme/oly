import { request } from "http";
import { axios, IKoaContext, IKoaMiddleware } from "oly-http";
import { parse, Url } from "url";

export class ReactProxyService {

  /**
   * Set up proxy.
   *
   * @param remote    Url where point is available
   */
  public useProxy(remote: string): any {
    return this.proxy(parse(remote));
  }

  /**
   * Try to get the template from remote.
   *
   * @param remote    Url where point is available
   */
  public async getTemplate(remote: string): Promise<string> {
    return (await axios.get(remote)).data;
  }

  /**
   * Very basic proxy koa middleware.
   *
   * @param url
   */
  public proxy(url: Url): IKoaMiddleware {
    return (ctx, next) => {

      if (!this.isReactRouterUrl(ctx)) {
        return next();
      }

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
          const keys = Object.keys(res.headers);
          for (const name of keys) {
            if (name === "transfer-encoding") {
              continue;
            }
            const header = res.headers[name];
            if (header) {
              ctx.set(name, header);
            }
          }
          resolve();
        }).end();
      });
    };
  }

  /**
   *
   * @param ctx
   */
  protected isReactRouterUrl(ctx: IKoaContext) {
    return !!ctx.req.url && ctx.req.url.indexOf(".") > -1;
  }
}
