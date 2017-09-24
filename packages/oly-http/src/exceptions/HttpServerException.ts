import { Exception } from "oly";
import { olyHttpErrors } from "../constants/errors";

/**
 * Public API exception. See ApiProvider.
 *
 * Note:
 * - there is no cause in #toJSON() in production. (security)
 * - stacktrace is always available on logging.
 * - status is added (default to 500)
 *
 * ```ts
 * class A {
 *    index() {
 *      throw new HttpServerException();
 *    }
 * }
 * ```
 *
 * Like others exceptions, this is designed to be extended.
 * ```ts
 * class BadRequestException extends HttpServerException {
 *    status = 400;
 * }
 * ```
 */
export class HttpServerException extends Exception {

  public message: string = olyHttpErrors.internalError();

  public status: number = 500;

  public toJSON(): object {
    return {
      ...super.toJSON(),
      status: this.status,
    };
  }
}
