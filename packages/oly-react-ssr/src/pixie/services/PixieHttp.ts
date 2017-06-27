import { env, Global, inject, Kernel } from "oly-core";
import { HttpClient, IHttpRequest } from "oly-http";
import { Pixie } from "./Pixie";
import { PixieSession } from "./PixieSession";

/**
 * It use HttpClient.
 *
 * All requests are wrapped with Pixie#fly().
 *
 * A token is sent on each request if PixieSession exists.
 */
export class PixieHttp {

  @env("PIXIE_HTTP_ROOT")
  public apiRoot: string = "";

  @inject
  protected kernel: Kernel;

  @inject
  protected pixie: Pixie;

  @inject
  protected session: PixieSession;

  @inject
  protected client: HttpClient;

  /**
   *
   */
  public get root(): string {
    if (Global.isBrowser()) {

      return this.apiRoot || this.pixie.get<string>("API_ROOT") || "/api";

    } else {

      if (this.apiRoot) {
        return this.pixie.set("API_ROOT", this.apiRoot);
      }

      // try to create API_ROOT based on oly-http an oly-api if available
      const port = this.kernel.state("HTTP_SERVER_PORT") || 3000;
      const host = this.kernel.state("HTTP_SERVER_HOST") || "localhost";
      const prefix = this.kernel.state("API_PREFIX") || "";

      if (!!prefix) {
        this.pixie.set("API_ROOT", prefix);
      }

      return `http://${host}:${port}${prefix}`;
    }
  }

  /**
   * Create an identifier used by pixie data.
   *
   * @param method    Http method
   * @param url       Http url
   * @internal
   */
  public createCacheKey(method: string, url: string) {
    return `${method} ${url.replace(/\//img, "")}`;
  }

  /**
   * Create a new http request.
   * It's like HttpClient#request(), except that result
   * are stored into pixie data.
   * This data is reused browser-side after a server-side rendering.
   *
   * @param options   HttpClient request options
   */
  public request<T>(options: IHttpRequest): Promise<T> {

    options.url = options.url || "/";
    options.headers = options.headers || {};
    options.method = options.method || "GET";

    const cacheKey = this.createCacheKey(options.method, options.url);

    if (options.url.indexOf("http") !== 0) {
      options.url = this.root + options.url;

      // bearer token integration
      //
      if (this.session.hasToken()) {
        options.headers.Authorization = `Bearer ${this.session.getToken()}`;
      }
    }

    return this.pixie.fly<T>(cacheKey,
      () => this.client.request<T>(options).then(({data}) => data));
  }
}
