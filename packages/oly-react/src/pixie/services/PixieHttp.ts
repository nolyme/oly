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
  protected pixieStore: PixieStore;

  @inject
  protected session: PixieSession;

  /**
   *
   */
  public get root(): string {
    if (Global.isBrowser()) {

      return this.apiRoot || this.pixieStore.get<string>("API_PREFIX") || "/api";

    } else {

      // try to create API_ROOT based on oly-http an oly-api if available
      const port = this.kernel.state("HTTP_SERVER_PORT") || 3000;
      const host = this.kernel.state("HTTP_SERVER_HOST") || "localhost";
      const prefix = this.kernel.state("API_PREFIX") || "";

      if (prefix) {
        this.pixieStore.set("API_PREFIX", prefix);
      }

      return `http://${host}:${port}${prefix}`;
    }
  }

  /**
   * Create a new http request.
   * It's like HttpClient#request(), except that result
   * are stored into pixieStore data.
   * This data is reused browser-side after a server-side rendering.
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

  public get<T = any>(url: string, options?: IHttpRequest): Promise<T> {
    return this.pixieStore.fly<T>(`GET_${url}`, () => super.get<T>(url, options));
  }

  public post<T = any>(url: string, body?: any, options?: IHttpRequest): Promise<T> {
    return this.pixieStore.fly<T>(`POST_${url}`, () => super.post<T>(url, body, options));
  }

  public put<T = any>(url: string, body?: any, options?: IHttpRequest): Promise<T> {
    return this.pixieStore.fly<T>(`PUT_${url}`, () => super.put<T>(url, body, options));
  }

  public del<T = any>(url: string, options?: IHttpRequest): Promise<T> {
    return this.pixieStore.fly<T>(`DEL_${url}`, () => super.del<T>(url, options));
  }
}
