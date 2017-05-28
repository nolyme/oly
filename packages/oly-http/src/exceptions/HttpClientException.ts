import { AxiosError } from "axios";
import { Exception } from "oly-core";
import { IHttpResponse } from "../interfaces";

/**
 * Exception thrown by a axios (http client).
 * Default status is -1 (no status).
 */
export class HttpClientException extends Exception {

  public status: number = -1;

  public cause: AxiosError;

  public constructor(source: AxiosError) {
    super(source);

    if (!source.response) {
      return;
    }

    if (this.isHttpServerException(source.response)) {
      this.message = source.response.data.message;
      this.status = source.response.data.status;
      this.name = source.response.data.name;
    } else {
      if (typeof source.response.data === "string") {
        this.message = source.response.data;
      }
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
