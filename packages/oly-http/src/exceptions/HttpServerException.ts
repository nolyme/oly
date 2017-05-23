import { Exception } from "oly-core";
import { olyApiErrors } from "../constants/errors";

/**
 * Http server exception.
 * It's like a public exception:
 * - there is no source in #toJSON()
 * - however, stacktrace is always available on logging
 * - status is added (default to 500)
 *
 * ```typescript
 * class A {
 *    index() {
 *      throw new HttpServerException();
 *    }
 * }
 * ```
 *
 * Like others exception, it's cool to extend this thing:
 * ```
 * class BadRequestException extends HttpServerException {
 *    status = 400;
 * }
 * ```
 */
export class HttpServerException extends Exception {

  public static readonly DEFAULT_MESSAGE: string = olyApiErrors.internalError();

  public status: number = 500;

  public toString(): string {
    const source = this.source ? `\n\n Caused by: ${this.source}` : "";
    return `${this.name}(${this.status}): ${this.message}${this.stack}${source}`;
  }

  public toJSON(): object {
    return {
      message: this.message,
      name: this.name,
      status: this.status,
    };
  }
}
