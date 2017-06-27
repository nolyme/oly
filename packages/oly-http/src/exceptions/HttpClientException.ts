import { AxiosError } from "axios";
import { Exception } from "oly-core";
import { olyHttpErrors } from "../constants/errors";
import { IHttpResponse } from "../interfaces";

/**
 * Exception thrown by a axios (http client).
 * Default status is -1 (no status).
 */
export class HttpClientException extends Exception {

  public status: number = -1;

  public exception: string;

  public cause: AxiosError;

  public constructor(source: AxiosError) {
    super(source);

    if (!source.response) {
      this.exception = source.name;
      this.message = source.message;
      return;
    }

    if (this.isHttpServerException(source.response)) {
      this.message = source.response.data.message;
      this.status = source.response.data.status;
      this.exception = source.response.data.name;
    } else {
      this.message = olyHttpErrors.requestHasFailed(source.config.method, source.config.url);
      this.status = source.response.status;
    }
  }

  protected isHttpServerException(response: IHttpResponse<any>): boolean {
    return !!response.data
      && !!response.data.status
      && !!response.data.name
      && !!response.data.message;
  }
}
