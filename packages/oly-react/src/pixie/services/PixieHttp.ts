import { env, Global, inject, Kernel } from "oly";
import { HttpClient, IHttpRequest, IHttpResponse } from "oly-http";
import { PixieSession } from "./PixieSession";
import { PixieStore } from "./PixieStore";

/**
 * HttpClient with PixieStore.
 *
 * All get|post|... requests are wrapped with PixieStore#fly().
 */
export class PixieHttp extends HttpClient {

  /**
   * Force ApiRoot.
   */
  @env("PIXIE_HTTP_ROOT")
  public apiRoot: string = "";

  @inject
  protected kernel: Kernel;

  @inject
  protected store: PixieStore;

  @inject
  protected session: PixieSession;

  /**
   * API Prefix. Each request starting with / will be prefixed by root. See PIXIE_HTTP_ROOT.
   */
  public get root(): string {
    if (Global.isBrowser()) {

      return this.apiRoot || this.store.get<string>("API_PREFIX") || "/api";

    } else {

      // try to create API_ROOT based on oly-http an oly-api if available
      const port = this.kernel.state("HTTP_SERVER_PORT") || 3000;
      const host = this.kernel.state("HTTP_SERVER_HOST") || "localhost";
      const prefix = this.kernel.state("API_PREFIX") || "";

      if (prefix) {
        this.store.set("API_PREFIX", prefix);
      }

      return `http://${host}:${port}${prefix}`;
    }
  }

  /**
   * Like HttpClient#request() with
   *
   * - an auto-prefix if possible (see PixieHttp#root)
   * - auto-authorization if possible (see PixieSession#getIdentity())
   *
   * <br/>
   * Response is not CACHED into PixieStore unlike PixieHttp#get() & cie.
   *
   * @param options   HttpClient request options
   */
  public request<T = any>(options: IHttpRequest): Promise<IHttpResponse<T>> {

    options.method = options.method || "GET";
    options.url = options.url || "/";
    options.headers = options.headers || {};

    if (options.url.indexOf("http") !== 0) {
      options.url = this.root + options.url;
    }

    const identity = this.session.getIdentity();
    if (!!identity) {
      options.headers["Authorization"] = `Bearer ${identity}`;
    }

    return super.request<T>(options);
  }

  /**
   * Make a HTTP GET and cache response with PixieStore#fly(). </br>
   * Based on HttpClient#get().
   *
   * @param {string} url
   * @param {IHttpRequest} options
   * @returns {Promise<T>}
   */
  public get<T = any>(url: string, options?: IHttpRequest): Promise<T> {
    return this.store.fly<T>(`GET_${url}`, () => super.get<T>(url, options));
  }

  /**
   * Make a HTTP POST and cache response with PixieStore#fly(). </br>
   * Based on HttpClient#post().
   *
   * @param {string} url
   * @param body
   * @param {IHttpRequest} options
   * @returns {Promise<T>}
   */
  public post<T = any>(url: string, body?: any, options?: IHttpRequest): Promise<T> {
    return this.store.fly<T>(`POST_${url}`, () => super.post<T>(url, body, options));
  }

  /**
   * Make a HTTP PUT and cache response with PixieStore#fly(). </br>
   * Based on HttpClient#put().
   *
   * @param {string} url
   * @param body
   * @param {IHttpRequest} options
   * @returns {Promise<T>}
   */
  public put<T = any>(url: string, body?: any, options?: IHttpRequest): Promise<T> {
    return this.store.fly<T>(`PUT_${url}`, () => super.put<T>(url, body, options));
  }

  /**
   * Make a HTTP DEL and cache response with PixieStore#fly(). </br>
   * Based on HttpClient#del().
   *
   * @param {string} url
   * @param {IHttpRequest} options
   * @returns {Promise<T>}
   */
  public del<T = any>(url: string, options?: IHttpRequest): Promise<T> {
    return this.store.fly<T>(`DEL_${url}`, () => super.del<T>(url, options));
  }
}
