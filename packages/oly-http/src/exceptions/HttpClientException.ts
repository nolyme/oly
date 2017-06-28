import { AxiosError } from "axios";
import { Exception } from "oly-core";
import { olyHttpErrors } from "../constants/errors";
import { IHttpResponse } from "../interfaces";

/**
 * Exception thrown by a axios (http client).
 * Default status is -1 (no status).
 */
export class HttpClientException extends Exception {

  /**
   * Status of the failed request.
   */
  public status: number = -1;

  /**
   * Identifier (or not) exception/error name.
   */
  public type: string;

  /**
   * Raw body is exists.
   * Body can be a string/object/... and null!
   */
  public error?: AxiosError;

  public constructor(error: AxiosError) {
    super();
    this.error = error;

    if (!error.response) {
      this.type = error.name;
      this.message = error.message;
      return;
    }

    if (this.isHttpServerException(error.response)) {
      // Error come from our Server with an HttpServerException
      this.message = error.response.data.message;
      this.status = error.response.data.status;
      this.type = error.response.data.name;
    } else {
      // Error come from somewhere else
      this.message = olyHttpErrors.requestHasFailed(error.config.method, error.config.url);
      this.status = error.response.status;
      this.type = "UnknownError";
    }
  }

  protected isHttpServerException(response: IHttpResponse<any>): boolean {
    return !!response.data
      && !!response.data.status
      && !!response.data.name
      && !!response.data.message;
  }
}
