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

      return this.apiRoot || this.pixie.get<string>("API_PREFIX") || "/api";

    } else {

      // try to create API_ROOT based on oly-http an oly-api if available
      const port = this.kernel.state("HTTP_SERVER_PORT") || 3000;
      const host = this.kernel.state("HTTP_SERVER_HOST") || "localhost";
      const prefix = this.kernel.state("API_PREFIX") || "";

      if (prefix) {
        this.pixie.set("API_PREFIX", prefix);
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
    return `${method}_${url}`;
  }

  /**
   * Create a new http request.
   * It's like HttpClient#request(), except that result
   * are stored into pixie data.
   * This data is reused browser-side after a server-side rendering.
   *
   * @param options   HttpClient request options
   */
  public request<T = any>(options: IHttpRequest): Promise<T> {

    options.method = options.method || "GET";
    options.url = options.url || "/";
    options.headers = options.headers || {};

    const cacheKey = this.createCacheKey(options.method, options.url);

    if (options.url.indexOf("http") !== 0) {
      options.url = this.root + options.url;

      // bearer token integration
      //
      if (this.session.hasToken()) {
        options.headers.Authorization = `Bearer ${this.session.getToken()}`;
      }
    }

    return this.pixie.fly<T>(cacheKey, () => this.client.request<T>(options).then(({data}) => data));
  }

  /**
   * Make a GET request.
   * GET should be used by default.
   *
   * @param url       Complete url
   * @param options   Request options
   */
  public get<T = any>(url: string, options: IHttpRequest = {}): Promise<T> {

    options.url = url;

    return this.request(options);
  }

  /**
   * Make a POST request.
   * POST should be used when you create data.
   *
   * @param url       Complete url
   * @param data      Request body
   * @param options   Request options
   */
  public post<T = any>(url: string, data: any = {}, options: IHttpRequest = {}): Promise<T> {

    options.method = "POST";
    options.url = url;
    options.data = data;

    return this.request(options);
  }

  /**
   * Make a PUT request.
   * PUT should be used when you update data.
   *
   * @param url       Complete url
   * @param data      Request body
   * @param options   Request options
   */
  public put<T = any>(url: string, data: any = {}, options: IHttpRequest = {}): Promise<T> {

    options.method = "PUT";
    options.url = url;
    options.data = data;

    return this.request(options);
  }

  /**
   * Make a DEL request.
   * DEL should be used when you remove data.
   *
   * @param url       Complete url
   * @param options   Request options
   */
  public del<T = any>(url: string, options: IHttpRequest = {}): Promise<T> {

    options.method = "DELETE";
    options.url = url;

    return this.request(options);
  }
}
