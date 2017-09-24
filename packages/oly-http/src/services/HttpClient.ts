import { AxiosInstance, AxiosRequestConfig, default as axiosInstance } from "axios";
import { inject, Kernel, Logger, state } from "oly";
import { olyHttpEvents } from "../constants/events";
import { HttpClientException } from "../exceptions/HttpClientException";
import {
  IHttpClientBeforeEvent,
  IHttpClientErrorEvent,
  IHttpClientSuccessEvent,
  IHttpRequest,
  IHttpResponse,
} from "../interfaces";

/**
 * Simple wrapper of Axios.
 * Designed to be extended.
 */
export class HttpClient {

  @state
  protected axios: AxiosInstance = axiosInstance.create();

  @inject
  protected logger: Logger;

  @inject
  protected kernel: Kernel;

  /**
   * Configure a new axios instance.
   * Useful for attach BASE_URL or similar stuff.
   * > Use it for test only.
   *
   * @param options   Axios configuration
   * @internal
   */
  public with(options: AxiosRequestConfig): this {

    this.axios = axiosInstance.create(options);

    return this;
  }

  /**
   * Create a new http request.
   *
   * @param request   Http Request Options
   */
  public async request<T = any>(request: IHttpRequest): Promise<IHttpResponse<T>> {

    request.method = request.method || "GET";
    request.url = request.url || "/";

    this.logger.debug(`fetch ${request.method} ${request.url}`, {request});

    await this.kernel.emit(olyHttpEvents.HTTP_CLIENT_BEGIN, {request} as IHttpClientBeforeEvent);

    try {
      const response = await this.axios.request(request);

      await this.kernel.emit(olyHttpEvents.HTTP_CLIENT_SUCCESS, {response} as IHttpClientSuccessEvent);

      return response;

    } catch (e) {

      const error = new HttpClientException(e);

      this.logger.debug(`request ${request.method} ${request.url} has failed`, {error});

      await this.kernel.emit(olyHttpEvents.HTTP_CLIENT_ERROR, {error} as IHttpClientErrorEvent);

      throw error;
    }
  }

  /**
   * Make a GET request.
   * ```ts
   * await http.get("/users");
   * ```
   *
   * @param url       Complete url
   * @param options   Request options
   */
  public get<T = any>(url: string, options: IHttpRequest = {}): Promise<T> {

    options.url = url;

    return this.request<T>(options).then(({data}) => data);
  }

  /**
   * Make a POST request.
   * ```ts
   * await http.post("/users", {name: "Jean"});
   * ```
   *
   * @param url       Complete url
   * @param body      Request body
   * @param options   Request options
   */
  public post<T = any>(url: string, body: any = {}, options: IHttpRequest = {}): Promise<T> {

    options.method = "POST";
    options.url = url;
    options.data = body;

    return this.request<T>(options).then(({data}) => data);
  }

  /**
   * Make a PUT request.
   * ```ts
   * await http.put("/users/1", {name: "Jean"});
   * ```
   *
   * @param url       Complete url
   * @param body      Request body
   * @param options   Request options
   */
  public put<T = any>(url: string, body: any = {}, options: IHttpRequest = {}): Promise<T> {

    options.method = "PUT";
    options.url = url;
    options.data = body;

    return this.request<T>(options).then(({data}) => data);
  }

  /**
   * Make a DEL request.
   * ```ts
   * await http.del("/users/1");
   * ```
   *
   * @param url       Complete url
   * @param options   Request options
   */
  public del<T = any>(url: string, options: IHttpRequest = {}): Promise<T> {

    options.method = "DELETE";
    options.url = url;

    return this.request<T>(options).then(({data}) => data);
  }
}
