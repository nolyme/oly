import { Global } from "../kernel/Global";
/**
 * It's an enhancement of Error with toJSON and cause.
 * There is also a hack that allow instanceof with es5.
 *
 * Exception has a real #toJSON(). It can be stringify.
 * It's useful when http, debug and message.
 *
 * ```ts
 * console.log(JSON.stringify(new Exception("A")));
 * ```
 *
 * Exception can have a cause (reason).
 * ```ts
 * try {
 *   try {
 *     throw new Error("A");
 *   } catch (e) {
 *     throw new Exception(e, "B");
 *   }
 * } catch (e) {
 *  throw new Exception(e, "C");
 * }
 * ```
 *
 * You can define a default message without pain.
 * ```ts
 * class MyException extends Exception {
 *    message = "My default message";
 * }
 * ```
 *
 * This is designed to be overridden.
 * ```ts
 * class MyException extends Exception {
 * }
 * new MyException().name // "MyException"
 * ```
 *
 * You can use `instanceof` without fear.
 * ```ts
 * try {
 *  throw new Exception();
 * } catch (e) {
 *  console.log(e instanceof Object); // true
 *  console.log(e instanceof Error); // true
 *  console.log(e instanceof Exception); // true
 *  console.log(e instanceof Number); // false
 * }
 * ```
 */
export class Exception extends Error {

  public static DEFAULT_MESSAGE = `An exception has been thrown without any message`;

  // tslint:disable-next-line
  __proto__: Error;

  /**
   * Error name.
   * It's not virtual, it's mutable.
   * By default, `name = constructor.name`.
   */
  public readonly name: string;

  /**
   * Error cause.
   * Optional Error/Exception which has triggered this exception.
   * It's useful when you have long business logic.
   */
  public readonly cause?: Throwable;

  /**
   * Our witness error.
   * It's useful because we have a virtual #stack and #message.
   */
  private readonly source: Error & { isMutable?: boolean };

  /**
   * Create a new exception.
   *
   * @param cause         Source (cause) or message
   * @param message       Optional message if not set as source
   */
  public constructor(cause?: string | Throwable, message?: string) {
    const trueProto = new.target.prototype;
    super();
    this.__proto__ = trueProto;

    const sourceMessage = (typeof cause === "string"
        ? cause
        : message) || Exception.DEFAULT_MESSAGE;

    const name = (this.constructor as any).name || "Error";
    const source = new Error();

    Object.defineProperty(this, "source", {get: () => source});
    Object.defineProperty(this, "name", {get: () => name});

    this.source.message = sourceMessage;

    if (typeof cause !== "string" && typeof cause !== "undefined") {
      Object.defineProperty(this, "cause", {get: () => cause});
    }

    // if we have a default message, it will be overridden by children "default message"
    this.source.isMutable = this.source.message === Exception.DEFAULT_MESSAGE;

    // show real stack trace on Node
    // this breaks sourcemaps on browsers
    if (!Global.isBrowser()) {
      Object.defineProperty(this, "stack", {get: () => this.getLongStackTrace()});
    }
  }

  /**
   *
   */
  public get message(): string {
    return this.source.message;
  }

  /**
   *
   * @param m
   */
  public set message(m: string) {
    if (this.source.isMutable) {
      this.source.message = m;
    }
  }

  /**
   * Get the long stack trace.
   */
  public getLongStackTrace(): string {

    let level = 0;
    let parent = this as any;
    while (parent && parent.__proto__ && parent.__proto__.constructor !== Exception) {
      if (level >= 100) {
        throw new TypeError("Infinite loop");
      }
      level++;
      parent = parent.__proto__;
    }

    let stack = this.source.stack || "";

    // remove constructor-lines, it's useless
    const array = stack.split("\n");
    array.splice(1, 1 + level);
    stack = array.join("\n").replace("Error:", this.name + ":");

    if (this.cause) {
      stack += `\n\nCaused by: ${this.cause.stack}`;
    }

    return stack;
  }

  /**
   * Override toString to add the cause.
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
   * Designed to be overridden.
   *
   * ```ts
   * class A extends Exception {
   *   toJSON() {
   *     return {
   *       ...super.toJSON(),
   *       a: "b",
   *     }
   *   }
   * }
   * ```
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
 * Exception or Error. no more.
 */
export type Throwable = Error | Exception;
