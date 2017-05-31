import { CommonUtil as _, env, inject, Kernel } from "oly-core";
import { HttpClient, IHttpRequest } from "oly-http";
import { Pixie } from "./Pixie";
import { PixieSession } from "./PixieSession";

/**
 * Axios wrapped with pixie#fly to cache response.
 * Also support auto API_ROOT if oly-api is used.
 */
export class PixieHttp {

  @env("OLY_PIXIE_HTTP_ROOT")
  public apiRoot: string = "";

  @inject(Kernel)
  protected kernel: Kernel;

  @inject(Pixie)
  protected pixie: Pixie;

  @inject(PixieSession)
  protected session: PixieSession;

  @inject(HttpClient)
  protected client: HttpClient;

  /**
   *
   */
  public get root(): string {
    if (this.pixie.isBrowser()) {
      return this.apiRoot || this.pixie.get<string>("API_ROOT") || "/api";
    } else {

      if (this.apiRoot) {
        return this.pixie.set("API_ROOT", this.apiRoot);
      }

      // try to create API_ROOT based on oly-http an oly-api if available
      const port = this.kernel.state("OLY_HTTP_SERVER_PORT") || 3000;
      const host = this.kernel.state("OLY_HTTP_SERVER_HOST") || "localhost";
      const prefix = this.kernel.state("OLY_API_PREFIX") || "";

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

  /**
   * Make a GET request.
   * GET should be use by default.
   *
   * @param url       Http url
   * @param options   Request options (headers?)
   */
  public get<T>(url: string, options: IHttpRequest = {}): Promise<T> {
    return this.request(Object.assign({}, options, {url, method: "GET"}));
  }

  /**
   * Make a POST request.
   * POST should be use when you create data.
   *
   * @param url       Http url
   * @param data      Request body
   * @param options   Request options (headers?)
   */
  public post<T>(url: string, data: any, options: IHttpRequest = {}): Promise<T> {
    return this.request(Object.assign({}, options, {url, method: "POST", data}));
  }

  /**
   * Make a PUT request.
   * PUT should be use when you update data.
   *
   * @param url       Http url
   * @param data      Request body
   * @param options   Request options (headers?)
   */
  public put<T>(url: string, data: any, options: IHttpRequest = {}): Promise<T> {
    return this.request(Object.assign({}, options, {url, method: "PUT", data}));
  }

  /**
   * Make a DEL request.
   * DEL should be use when you remove data.
   *
   * @param url       Http url
   * @param options   Request options (headers?)
   */
  public del<T>(url: string, options: IHttpRequest = {}): Promise<T> {
    return this.request(Object.assign({}, options, {url, method: "DELETE"}));
  }
}
