import { AxiosError, AxiosInstance, AxiosRequestConfig, default as axiosInstance } from "axios";
import { Exception, inject, Logger, state } from "oly-core";
import { HttpClientException } from "../exceptions/HttpClientException";
import { IHttpRequest, IHttpResponse } from "../interfaces";

/**
 * Simple wrapper of Axios.
 * Designed to be extended.
 */
export class HttpClient {

  @state
  protected axios: AxiosInstance = this.createAxios();

  @inject
  protected logger: Logger;

  /**
   * Configure a new axios instance.
   * Useful for attach BASE_URL or similar stuff.
   * Use it for test only.
   *
   * @param options   Axios configuration
   */
  public with(options: AxiosRequestConfig): this {
    this.axios = axiosInstance.create(options);
    return this;
  }

  /**
   * Create a new http request.
   *
   * @param options   Http Request Options
   */
  public request<T>(options: IHttpRequest): Promise<IHttpResponse<T>> {
    this.logger.debug(`fetch ${options.method || "GET"} ${options.url}`, {request: options});
    return this.axios
      .request(options)
      .catch((e: AxiosError) => this.errorHandler(options, e));
  }

  /**
   * Make a GET request.
   * GET should be use by default.
   *
   * @param url       Complete url
   * @param options   Request options (headers?)
   */
  public get<T>(url: string, options: IHttpRequest = {}): Promise<IHttpResponse<T>> {

    options.url = url;

    return this.request(options);
  }

  /**
   * Make a POST request.
   * POST should be use when you create data.
   *
   * @param url       Complete url
   * @param data      Request body
   * @param options   Request options (headers?)
   */
  public post<T>(url: string, data: any = {}, options: IHttpRequest = {}): Promise<IHttpResponse<T>> {

    options.method = "POST";
    options.url = url;
    options.data = data;

    return this.request(options);
  }

  /**
   * Make a PUT request.
   * PUT should be use when you update data.
   *
   * @param url       Complete url
   * @param data      Request body
   * @param options   Request options (headers?)
   */
  public put<T>(url: string, data: any = {}, options: IHttpRequest = {}): Promise<IHttpResponse<T>> {

    options.method = "PUT";
    options.url = url;
    options.data = data;

    return this.request(options);
  }

  /**
   * Make a DEL request.
   * DEL should be use when you remove data.
   *
   * @param url       Complete url
   * @param options   Request options (headers?)
   */
  public del<T>(url: string, options: IHttpRequest = {}): Promise<IHttpResponse<T>> {

    options.method = "DELETE";
    options.url = url;

    return this.request(options);
  }

  /**
   *
   */
  protected createAxios() {
    return axiosInstance.create();
  }

  /**
   * Catch any response with status >= 400.
   *
   * @param options     Request configuration
   * @param error       Axios error
   */
  protected errorHandler(options: IHttpRequest, error: AxiosError) {

    if (!error.response) {
      throw new Exception(error.message);
    }

    this.logger.debug(`request ${options.method || "GET"} ${options.url} has failed`, error.response.data);

    throw new HttpClientException(error);
  }
}
