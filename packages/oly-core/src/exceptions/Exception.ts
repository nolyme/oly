import { olyCoreErrors } from "../constants/errors";
import { _ } from "../utils/CommonUtil";

/**
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
export class Exception {

  /**
   * Use this message is no message was given.
   */
  public static defaultMessage: string = olyCoreErrors.defaultException();

  public name: string;
  public message: string;
  public source: Error;
  public cause?: Exception | Error;

  /**
   * Create a new exception.
   *
   * @param cause       Source (cause) or message
   * @param description Optional message if not set as source
   */
  public constructor(cause?: string | Throwable, description?: string) {

    // local
    const self = this;
    const type = self.constructor as any;

    // attributes
    const message = (typeof cause === "string" ? cause : description) || type.defaultMessage;
    if (typeof cause !== "string" && typeof cause !== "undefined") {
      this.cause = cause;
    }

    const source = new Error(message);
    Object.defineProperty(this, "name", {get: () => type.name});
    Object.defineProperty(this, "message", {get: () => message});
    Object.defineProperty(this, "source", {get: () => source});

    // tricky part
    const ctx = Error.apply(this, [message]);
    Object.defineProperty(ctx, "name", {get: () => type.name});
    Object.defineProperty(ctx, "message", {get: () => message});
    Object.defineProperty(ctx, "source", {get: () => source});
    Object.defineProperty(ctx, "toJSON", {value: self.toJSON});
    Object.defineProperty(ctx, "toString", {value: self.toString});
    Object.defineProperty(ctx, "stack", {get: () => self.stack});

    _.assign(ctx, this);
  }

  /**
   *
   */
  public get stack(): string {

    let level = 0;
    let parent = this;
    while (parent && parent["__proto__"] && parent["__proto__"].constructor !== Exception) {
      level++;
      parent = parent["__proto__"];
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

    let message = `OHBOY ${this.name}: ${this.message}`;

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

Exception.prototype["__proto__"] = Error.prototype;
