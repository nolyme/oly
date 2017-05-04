/**
 * Util for create Error with status and details.
 */
export class HttpError extends Error {

  public static MESSAGES = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    406: "Not Acceptable",
    409: "Conflict",
    500: "Internal Server Error",
    501: "Not Implemented",
  };

  /**
   * Http Error message. (e.g 'User not found')
   * This is already defined in Error. Okay?
   */
  public message: string;

  /**
   * Extension: HttpStatus (e.g 400, 500, ...)
   * Based on https://en.wikipedia.org/wiki/List_of_HTTP_status_codes.
   */
  public status: number;

  /**
   * Extension: Details (could be anything)
   * Free Object field for more details.
   */
  public details: any;

  /**
   * Create a new http error.
   *
   * @param status    Http status code
   * @param message   Http error message
   * @param details   More details
   */
  public constructor(status?: number, message?: string, details?: any) {
    super(message);

    this.status = status || 500;
    this.message = message || "";

    if (details) {
      if (details instanceof Error) {

        // error on error
        this.details = details;
      } else if (details.details) {

        // error on error
        this.details = details.details;
      } else if (details.data) {

        // http response
        this.details = details.data;
      } else if (details.message) {

        // error on error without details
        this.details = details.message;
      } else {

        // otherwise
        this.details = details;
      }
    }

    if (!message) {
      this.message = HttpError.MESSAGES[this.status] || HttpError.MESSAGES[500];
    }
  }
}
