import { AxiosError } from "axios";
import { Exception } from "oly";
import { olyHttpErrors } from "../constants/errors";

/**
 * Exception wrapper of AxiosError. <br/>
 *
 * ### Fields
 *
 * | | type | default  | description |
 * |--|--|--|--|
 * | status | number | -1 | HTTP status |
 * | body | any | undefined | HTTP response body |
 * | cause | AxiosError | N/A | axios error |
 *
 * ```ts
 * try {
 *   await http.get("/");
 * } catch(e) {
 *   if(e instanceof HttpClientException) {
 *
 *     if (e.status === 401) {
 *       // ...
 *     }
 *   }
 * }
 * ```
 *
 * ### Follow HttpServerException
 *
 * ```ts
 * try {
 *   await http.get("/");
 * } catch(e) {
 *   if (e instanceof HttpClientException) {
 *
 *     if (e.isHttpServerException()) {
 *        (e as HttpClientException<HttpServerException>)
 *         .body
 *         .message; // ...
 *     }
 *   }
 * }
 * ```
 */
export class HttpClientException<T = any> extends Exception {

  /**
   * Status of the failed request.
   */
  public status: number = -1;

  /**
   * Response body if exists.
   */
  public body: T;

  /**
   * AxiosError is always the cause.
   * This is very useful when you have no response (like e no network)
   */
  public cause: AxiosError;

  public constructor(error: AxiosError) {
    super(error);

    if (!error.response) {
      // Error network
      this.message = error.message;
      return;
    }

    if (this.isHttpServerException()) {
      // Error come from our Server with an HttpServerException
      this.message = olyHttpErrors.requestHasFailedWithMessage(
        error.config.method,
        error.config.url,
        error.response.status,
        error.response.data.message);
      this.status = error.response.data.status;
      this.body = error.response.data;
    } else {
      // Error come from somewhere else
      if (typeof error.response.data === "string") {
        this.message = olyHttpErrors.requestHasFailedWithMessage(
          error.config.method,
          error.config.url,
          error.response.status,
          error.response.data);
      } else {
        this.message = olyHttpErrors.requestHasFailed(
          error.config.method,
          error.config.url,
          error.response.status);
      }
      this.status = error.response.status;
      this.body = error.response.data;
    }
  }

  public toJSON(): object {
    return {
      ...super.toJSON(),
      body: this.body,
      status: this.status,
    };
  }

  public isHttpServerException(withName?: string): boolean {

    if (!(
        !!this.cause
        && !!this.cause.response
        && !!this.cause.response.data
        && !!this.cause.response.data.status
        && !!this.cause.response.data.name
        && !!this.cause.response.data.message)) {
      return false;
    }

    if (!withName) {
      return true;
    }

    return this.cause.response.data.name === withName;
  }
}
