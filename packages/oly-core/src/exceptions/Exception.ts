import { olyCoreErrors } from "../constants/errors";

/**
 * Exception.
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
 */
export class Exception extends Error {

  public name: string;

  public cause?: Exception | Error;

  private source: Error;

  /**
   * Create a new exception.
   *
   * @param cause       Source (cause) or message
   * @param description Optional message if not set as source
   */
  public constructor(cause?: string | Throwable, description?: string) {
    super();

    this.name = this.constructor.name;
    this.source = new Error(); // because we have a virtual message and a virtual stack
    this.source.message = (
        typeof cause === "string"
          ? cause
          : description)
      || olyCoreErrors.defaultException();

    if (typeof cause !== "string" && typeof cause !== "undefined") {
      this.cause = cause;
    }

    const define = Object.defineProperty;

    define(this, "stack", {
      get: () => this.getStackTrace(),
    });
    define(this, "message", {
      get: () => this.source.message,
      set: (message) => {
        if (this.source.message === olyCoreErrors.defaultException()) {
          this.source.message = message;
        }
      },
    });
  }

  /**
   *
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
   *
   */
  public toString(): string {

    let message = `${this.name}: ${this.message}`;

    if (this.cause) {
      message += ". Caused by: " + this.cause;
    }

    return message;
  }

  /**
   *
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

export type Throwable = Error | Exception;
