import { AxiosInstance, AxiosRequestConfig, default as axiosInstance } from "axios";
import { inject, Kernel, Logger, state } from "oly-core";
import { olyHttpEvents } from "../constants/events";
import { HttpClientException } from "../exceptions/HttpClientException";
import {
  IHttpClientBeforeEvent, IHttpClientErrorEvent, IHttpClientSuccessEvent, IHttpRequest,
  IHttpResponse,
} from "../interfaces";

/**
 * Simple wrapper of Axios.
 * Designed to be extended.
 */
export class HttpClient {

  @state
  protected axios: AxiosInstance = this.createAxios();

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
  public async request<T>(request: IHttpRequest): Promise<IHttpResponse<T>> {

    request.method = request.method || "GET";
    request.url = request.url || "/";

    this.logger.debug(`fetch ${request.method} ${request.url}`, {request});

    await this.kernel.emit(olyHttpEvents.HTTP_CLIENT_BEFORE, {request} as IHttpClientBeforeEvent);

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
   * GET should be use by default.
   *
   * @param url       Complete url
   * @param options   Request options
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
   * @param options   Request options
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
   * @param options   Request options
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
   * @param options   Request options
   */
  public del<T>(url: string, options: IHttpRequest = {}): Promise<IHttpResponse<T>> {

    options.method = "DELETE";
    options.url = url;

    return this.request(options);
  }

  /**
   *
   */
  protected createAxios(): AxiosInstance {
    return axiosInstance.create();
  }
}
