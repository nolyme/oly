import * as merge from "deepmerge";

export class Global {

  public static noop: any = () => undefined;

  public static merge(...obj: object[]): any {
    return merge.all(obj);
  }

  public static isProduction(): boolean {
    return process.env.NODE_ENV === "production";
  }

  public static isTest(): boolean {
    return process.env.NODE_ENV === "test";
  }

  public static isBrowser(): boolean {
    return typeof window === "object" && typeof window.document === "object";
  }

  public static get(key: string): any {
    const g: any = Global.isBrowser() ? window : global;
    g.oly = g.oly || {};
    return g.oly[key];
  }

  public static set(key: string, value: any): void {
    const g: any = Global.isBrowser() ? window : global;
    g.oly = g.oly || {};
    g.oly[key] = value;
  }

  /**
   * Generate a short id.
   *
   * @param size  Size of the Id
   */
  public static shortid(size: number = 12): string {
    if (size < 4 || size > 18) {
      throw new Error("shortid length > 4 && < 18");
    }
    return (Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)).slice(0, size);
  }

  /**
   * Delay powered by promise.
   * This is just a wrapper of setTimeout.
   *
   * @param ms    Time in millisecond
   */
  public static timeout(ms: number): Promise<void> {
    return new Promise<void>((resolve) => setTimeout(() => resolve(), ms));
  }

  /**
   * Universal atob.
   *
   * @param raw   Raw BASE64 string
   * @return      Decoded string
   */
  public static atob(raw: string): string {
    if (typeof window === "object") {
      return window.atob(raw);
    }
    const b = "Buffer";
    return global[b].from(raw, "base64").toString("ascii");
  }

  /**
   * A lightweight string replace engine for text-based templates.
   *
   * ```
   * _.template("Hello ${name}", {name: "World"}); // Hello World
   * ```
   *
   * @param text
   * @param map
   * @return {string}
   */
  public static template(text: string, map: { [key: string]: any }): string {

    return text.replace(/\$\{([0-9a-zA-Z_.\-/\\]+)\}/g, (match, key) => {

      const value = map[key];
      if (value === null || value === undefined) {
        return match;
      }

      return value;
    });
  }

  /**
   * Make a comparison of two classes.
   * Works with "npm link" and duplicates classes.
   *
   * @param type1   Class 1
   * @param type2   Class 2
   */
  public static isEqualClass(type1: any, type2: any) {

    if (typeof type1 !== "function" || typeof type2 !== "function") {
      return false;
    }

    if (type1 === type2) {
      return true;
    }

    if (!Global.isProduction()
      && typeof type1.name === "string"
      && type1.name === type2.name) {
      const keys1 = Object.getOwnPropertyNames(type1.prototype);
      const keys2 = Object.getOwnPropertyNames(type2.prototype);
      for (let i = 0; i < keys1.length; i++) {
        if (keys1[i] !== keys2[i]) {
          return false;
        }
      }

      return ("" + type1) === ("" + type2);
    }

    return false;
  }

  /**
   * Create an identifier with a class and one of his propertyKey.
   * This is important and used by many of oly packages.
   *
   * Class A { b() {} } -> "A.b".
   */
  public static identity(target: Function | object, propertyKey: string): string {
    if (typeof target === "object") {
      return `${target.constructor.name}.${propertyKey}`;
    }
    return `${target.name}.${propertyKey}`;
  }

  /**
   * Generic bubble sort.
   * Used to sort kernel dependencies.
   *
   * @param arr   Array, entries
   * @param fn    Comparator, function used for compare
   */
  public static bubble<T>(arr: T[], fn: (arr: T[], i: number) => boolean): T[] {

    const entries = arr.slice();
    let swapped;

    do {
      swapped = false;
      for (let i = 0; i < entries.length - 1; i++) {
        if (fn(entries, i)) {
          const temp = entries[i];
          entries[i] = entries[i + 1];
          entries[i + 1] = temp;
          swapped = true;
        }
      }
    } while (swapped);

    return entries;
  }

  /**
   * Check if a definition can be named as IProvider.
   * Providers can't be injected after #start().
   *
   * It's just a protection to avoid some shitty behavior.
   *
   * @param definition  Class definition
   */
  public static isProvider(definition: Function): boolean {

    if (
      !!definition.prototype.onConfigure ||
      !!definition.prototype.onStart ||
      !!definition.prototype.onStop
    ) {
      return true;
    }

    return false;
  }
}

export const _ = Global;
