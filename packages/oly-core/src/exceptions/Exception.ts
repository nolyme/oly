/**
 * Imitation of Error.
 */
export class Exception {

  public static DEFAULT_NAME = "UnknownException";
  public static DEFAULT_MESSAGE = "An exception has been thrown without any message";

  /**
   * Transform Error to Exception.
   *
   * @param error   Internal Error instance
   * @return        Fresh exception
   */
  public static convert(error: Error): Exception {
    const instance = new Exception(error.message);

    instance.stack = error.stack;
    instance.name = error.name;

    // stack of error has name+message on the top :(
    if (instance.stack) {
      instance.stack = instance.stack.replace(`${error.name}: ${error.message}`, "");
    }

    return instance;
  }

  /**
   * Like Error#name.
   * This is most of the time the constructor name.
   *
   * ```typescript
   * class MyCustomException extends Exception {
   *  name = "WatWat";
   * }
   * ```
   */
  public name: string;

  /**
   * Like Error#message.
   */
  public message: string;

  /**
   * Like Error#stack.
   */
  public stack?: string;

  /**
   * Optional source exception.
   */
  public source?: Exception;

  /**
   * Create a new exception.
   *
   * @param source    Or message, source accept Exception and Error
   * @param message   Optional message if not set as source
   */
  public constructor(source: string | Exception | Error, message?: string) {

    this.name = this.constructor["name"] || Exception.DEFAULT_NAME; // tslint:disable-line
    this.stack = new Error().stack;

    if (typeof source !== "string") {
      if (source instanceof Error) {
        this.source = Exception.convert(source);
      } else {
        this.source = source;
      }
      this.message = message || Exception.DEFAULT_MESSAGE;
    } else {
      this.message = source;
    }
  }

  /**
   * Default toString() version.
   * It's very similar to Error#toString() except for the "Caused by:".
   */
  public toString(): string {
    const source = this.source ? `\n\n Caused by: ${this.source}` : "";
    return `${this.name}: ${this.message}${this.stack}${source}`;
  }

  /**
   *  JSON.stringify version.
   */
  public toJSON(): object {
    return {
      message: this.message,
      name: this.name,
      source: this.source,
    };
  }
}

export type ErrorOrException = Error | Exception;
