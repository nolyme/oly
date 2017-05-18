import { olyCoreErrors } from "../constants/errors";

/**
 * It's an imitation of Error. This is not an Error.
 *
 * Exception use Error for displaying the stacktrace.
 * Extract stacktrace operation is slow, so it's done only on demand (like Error).
 * ```typescript
 * console.log(new Exception().stack); //slow
 * ```
 *
 * Unlike Error, Exception has a real #toJSON().
 * ```typescript
 * console.log(JSON.stringify(new Exception("A")));
 * ```
 *
 * Unlike Error, Exception can have a source (reason).
 * ```typescript
 * try {
 *  throw new Exception("A");
 * } catch (e) {
 *  throw new Exception(e, "B");
 * }
 * ```
 */
export class Exception {

  /**
   * Use this message is no message was given.
   */
  public static DEFAULT_MESSAGE: string = olyCoreErrors.defaultException();

  /**
   * Convert a legacy Error to a new fresh Exception.
   *
   * @param error     Error
   * @return          Exception
   */
  public static convert(error: Error): Exception {
    const instance = new Exception(error.message);

    instance.name = error.name;
    instance.stack = error.stack || "";

    return instance;
  }

  /**
   * Like Error#name.
   * Most of the time, it is the constructor name.
   *
   * ```typescript
   * class MyCustomException extends Exception {
   *  name = "WatWat"; // override !!!!!
   * }
   * ```
   */
  public name: string;

  /**
   * Like Error#message.
   */
  public message: string;

  /**
   * Optional source exception.
   */
  public source?: Exception;

  /**
   * Like Error#stack but without name and message.
   * Trace is empty by default and filled only if you call #stack.
   */
  private trace?: string;

  /**
   * Capture error on the constructor.
   */
  private error: Error;

  /**
   * Create a new exception.
   *
   * @param source    Source (cause) or message
   * @param message   Optional message if not set as source
   */
  public constructor(source?: string | Throwable, message?: string) {

    this.name = this.constructor["name"]; // tslint:disable-line

    //
    // This is important to not read error.stack here
    // read stack is slow and should be executed only on demand
    this.error = new Error();

    if (typeof source === "string") {
      this.message = source;
    } else if (typeof source !== "undefined") {
      this.source = source instanceof Error ? Exception.convert(source) : source;
      if (!!message) {
        this.message = message;
      }
    }

    if (!this.message) {
      this.message = (this.constructor as any).DEFAULT_MESSAGE;
    }
  }

  /**
   * Get the complete stack trace.
   * Extract stack trace is a slow operation.
   */
  public get stack(): string {

    if (this.trace == null) {
      this.stack = this.error.stack || ""; // stack trace is extracted here
    }

    const source: string = this.source
      ? `\nCaused by: ${this.source.stack}`
      : "";

    return `${this.toString()}\n${this.trace}\n${source}`;
  }

  /**
   * Set a stack trace.
   *
   * @internal
   * @param trace
   */
  public set stack(trace: string) {
    this.trace = trace.split("\n").splice(2).join("\n");
  }

  /**
   * Default toString() version.
   * It's very similar to Error#toString() except for the "Caused by:".
   */
  public toString(): string {
    return `${this.name}: ${this.message}`;
  }

  /**
   *  JSON.stringify version.
   */
  public toJSON(): object {

    const json: any = {
      message: this.message,
      name: this.name,
    };

    if (this.source) {
      json.source = this.source;
    }

    return json;
  }
}

/**
 *
 */
export type Throwable = Exception | Error;
