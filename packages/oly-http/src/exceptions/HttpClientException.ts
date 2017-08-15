import { AxiosError } from "axios";
import { Exception } from "oly-core";
import { olyHttpErrors } from "../constants/errors";

/**
 * Exception thrown by a axios (http client).
 *
 * Default status is -1 (no status).
 * Default body is null.
 *
 * You can "follow" HttpServerException.
 *
 * ```ts
 * try { } catch(e) {
 *   if(e instanceof HttpClientException && e.isHttpServerException()) {
 *     (e as HttpClientException<HttpServerException>)
 *       .body
 *       .message; // ...
 *   }
 * }
 * ```
 *
 * Axios Error is always available.
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

  public isHttpServerException(): boolean {
    return !!this.cause
      && !!this.cause.response
      && !!this.cause.response.data
      && !!this.cause.response.data.status
      && !!this.cause.response.data.name
      && !!this.cause.response.data.message;
  }
}
