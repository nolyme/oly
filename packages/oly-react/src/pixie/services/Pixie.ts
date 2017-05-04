import { _, inject, Kernel, Logger } from "oly-core";

/**
 *
 */
export type Side = "browser" | "server" | "both";

/**
 *
 */
export interface IPixieSetOptions {
  only?: Side;
  once?: boolean;
}

/**
 * Use Pixie for handling ServerClient data use cases.
 * Pixie writes server-data into HTML and browser use HTML data.
 * The main goal is to not fetch API twice (Server+Client)
 * But you can "cache" future browser calls.
 */
export class Pixie {

  public static stateName = "__pixie__";

  @inject(Logger)
  protected logger: Logger;

  @inject(Kernel)
  protected kernel: Kernel;

  /**
   * Volatile data
   */
  protected data = {};

  /**
   * Check if window exists
   * @returns {boolean}
   */
  public isBrowser(): boolean {
    return typeof window !== "undefined"
      && typeof window.document !== "undefined";
  }

  /**
   * Negative isBrowser()
   * @returns {boolean}
   */
  public isServer(): boolean {
    return !this.isBrowser();
  }

  /**
   * Getter
   *
   * @param key
   * @returns {T}
   */
  public get<T>(key: string): T {
    return this.data[key] as T;
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

    if (typeof this.data[key] === "undefined" || !options.once) {
      if (
        options.only === "both"
        || (options.only === "browser" && this.isBrowser())
        || (options.only === "server" && !this.isBrowser())
      ) {
        this.data[key] = value;
      }
    }

    return this.data[key] as T;
  }

  /**
   * Like set, but for functions.
   * Function will be executed only in Server.
   * Browser will reused function result.
   * Async function with Promise is allowed.
   *
   * @param key     Identifier
   * @param func    Function to call which returns a value
   * @returns       The value
   */
  public fly<T>(key: string, func: () => Promise<T> | T) {

    const value = this.data[key];
    if (value != null) {

      this.logger.trace(`fly cached #${key}`);
      if (this.isBrowser()) {
        this.data[key] = null;
      }

      return Promise.resolve(value);
    }

    this.logger.trace(`fly unresolved #${key}`);

    return _.promise(func()).then((result: any) => {
      if (!this.isBrowser()) {
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
    return `<script>window.${Pixie.stateName}=${this.toString()}</script>`;
  }
}
