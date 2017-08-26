import { Global, inject, Kernel, Logger, state } from "oly";
import { IPixieSetOptions } from "../interfaces";

/**
 * Use Pixie for handling ServerClient data use cases.
 *
 * For cache http call: PixieHttp.
 * For cache session: PixieSession.
 *
 * Pixie writes server-data into HTML then browser use this data.
 */
export class Pixie {

  public static stateName = "__pixie__";

  @inject
  protected logger: Logger;

  @inject
  protected kernel: Kernel;

  /**
   * Volatile data
   */
  @state
  protected data: any;

  /**
   * Getter
   *
   * @param key
   * @returns {T}
   */
  public get<T>(key: string): T | undefined {
    if (!this.data) {
      return;
    }
    return this.data[key];
  }

  /**
   * Set value in pixie;
   * By default, store data only once and only on server env.
   *
   * @param key       Key
   * @param value     Value
   * @param options   only+once
   * @returns {T}
   */
  public set<T>(key: string, value: T, options: IPixieSetOptions = {}): T {
    options.only = options.only || "server";
    options.once = options.once !== false;

    if (!this.data) {
      this.data = {};
    }

    if (typeof this.data[key] === "undefined" || !options.once) {
      if (
        options.only === "both"
        || (options.only === "browser" && Global.isBrowser())
        || (options.only === "server" && !Global.isBrowser())
      ) {
        this.data[key] = value;
      }
    }

    return this.data[key] as T;
  }

  /**
   * Like set, but for functions.
   *
   * Function will be executed only in Server.
   * ```ts
   * // SERVER
   * pixie.fly(() => "DATA"); // called + cached
   * // BROWSER
   * pixie.fly(() => "DATA"); // use cache, remove cache
   * pixie.fly(() => "DATA"); // called
   * ```
   *
   * Async function with Promise is allowed.
   *
   * @param key     Identifier
   * @param func    Function to call which returns a value
   * @returns       The value
   */
  public fly<T>(key: string, func: () => Promise<T> | T): Promise<T> {

    if (!this.data) {
      this.data = {};
    }

    const value = this.data[key];
    if (value != null) {

      this.logger.trace(`fly cached #${key}`);
      if (Global.isBrowser()) {
        this.data[key] = null;
      }

      return Promise.resolve(value);
    }

    this.logger.trace(`fly unresolved #${key}`);

    return new Promise((eat) => eat(func())).then((result: any) => {
      if (!Global.isBrowser()) {
        this.logger.trace(`set '${key}' with`, result);
        this.data[key] = result;
      }
      return result;
    });
  }

  /**
   * Stringify store.
   *
   * @returns {string}
   */
  public toString(): string {
    this.logger.trace("stringify pixie data");
    return JSON.stringify(this.data);
  }

  /**
   * Wrap data into <script> tags.
   *
   * @returns {string}
   */
  public toHTML(): string {
    if (!this.data) {
      return "";
    }
    return `<script>window.${Pixie.stateName}=${this.toString()}</script>`;
  }
}
