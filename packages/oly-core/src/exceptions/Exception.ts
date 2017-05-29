import { olyCoreErrors } from "../constants/errors";

/**
 * Enhance Error with toJSON, cause, ...
 *
 * **warning**
 * This is totally broken in ES5 mode.
 *
 * Exception has a real #toJSON().
 * ```typescript
 * console.log(JSON.stringify(new Exception("A")));
 * ```
 *
 * Exception can have a cause (reason).
 * ```typescript
 * try {
 *   try {
 *     throw new Error("A");
 *   } catch (e) {
 *    throw new Exception(e, "B");
 *   }
 * } catch (e) {
 *  throw new Exception(e, "C");
 * }
 * ```
 *
 * You can set a default message.
 * ```
 * class MyException extends Exception {
 *    message = "My default message";
 * }
 * ```
 */
export class Exception extends Error {

  /**
   * Error name.
   */
  public name: string;

  /**
   * Error cause.
   */
  public cause?: Throwable;

  /**
   * Our witness error.
   * It's useful because we have a virtual #stack and #message.
   */
  private source: Error;

  /**
   * Create a new exception.
   *
   * @param cause         Source (cause) or message
   * @param message       Optional message if not set as source
   */
  public constructor(cause?: string | Throwable, message?: string) {
    super();

    this.name = (this.constructor as any).name;
    this.source = new Error();            // because we have a virtual message and a virtual stack
    this.source.message = (
        typeof cause === "string"
          ? cause
          : message)
      || olyCoreErrors.defaultException();

    if (typeof cause !== "string" && typeof cause !== "undefined") {
      this.cause = cause;
    }

    // if we have a default message, it will be overridable by children "default message"
    const isDefaultMessage = this.source.message === olyCoreErrors.defaultException();
    const define = Object.defineProperty;

    // getters/setters are broken on es6, we need to do this
    define(this, "stack", {
      get: () => this.getStackTrace(),
    });
    define(this, "message", {
      get: () => this.source.message,
      set: (m: string) => {
        if (isDefaultMessage) {
          this.source.message = m;
        }
      },
    });
  }

  /**
   * Get the long stack trace.
   */
  public getStackTrace(): string {

    let level = 0;
    let parent = this as any;
    while (parent && parent.__proto__ && parent.__proto__.constructor !== Exception) {
      level++;
      parent = parent.__proto__;
    }

    let stack = this.source.stack || "";

    // remove constructor-lines
    const array = stack.split("\n");
    array.splice(1, 1 + level);
    stack = array.join("\n").replace("Error:", this.name + ":");

    if (this.cause) {
      stack += `\n\nCaused by: ${this.cause.stack}`;
    }

    return stack;
  }

  /**
   * Override toString.
   */
  public toString(): string {

    let message = `${this.name}: ${this.message}`;

    if (this.cause) {
      message += ". Caused by: " + this.cause;
    }

    return message;
  }

  /**
   * Return error as object without shitty data.
   * Designed to be override.
   */
  public toJSON(): object {

    const json: any = {
      message: this.message,
      name: this.name,
    };

    if (this.cause) {
      if (this.cause instanceof Exception) {
        json.cause = this.cause.toJSON();
      } else {
        json.cause = {
          message: this.cause.message,
          name: this.cause.name,
        };
      }
    }

    return json;
  }
}

/**
 * Exception or Error.
 */
export type Throwable = Error | Exception;
