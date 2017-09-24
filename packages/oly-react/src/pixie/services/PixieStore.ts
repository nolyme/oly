import { Global, inject, Kernel, Logger } from "oly";
import { IPixieSetOptions } from "../interfaces";

/**
 * Store some data server side and send them to the browser.
 */
export class PixieStore {

  public static stateName = "__pixie__";

  @inject
  protected logger: Logger;

  @inject
  protected kernel: Kernel;

  /**
   * Volatile data
   */
  protected data: any;

  /**
   * Get a value from the store.
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
   * Set value to the store. Used by PixieStore#fly().
   *
   * ```ts
   * // server side
   * store.set("a", "b");
   * // browser side
   * store.set("a", "b"); // b is ignored
   * ```
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
   * Like set, but for functions. Used by PixieHttp#get().
   * Function will be called only server-side.
   *
   * ```ts
   * // server-side
   * await store.fly(() => "data"); // function is called, data are cached
   * // browser-side
   * await store.fly(() => "data"); // function is NOT called, data are re-used and removed from the store
   * await store.fly(() => "data"); // function is called
   * ```
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
   * @internal
   */
  public toString(): string {
    this.logger.trace("stringify pixie data");
    return JSON.stringify(this.data);
  }

  /**
   * Wrap data into <script> tags.
   *
   * @returns {string}
   * @internal
   */
  public toHTML(): string {

    if (!this.data) {
      return "";
    }

    return `<script>window.${PixieStore.stateName}=${this.toString()}</script>`;
  }
}
