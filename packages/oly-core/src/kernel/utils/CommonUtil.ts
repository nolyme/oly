/**
 * Collection of internal utils.
 */
import { IAnyDeclaration, IDeclarations } from "../interfaces/injections";

export class CommonUtil {

  /**
   * noop
   */
  public static noop: any = () => null;

  /**
   * Generate a short id.
   *
   * @param size  Size of the Id
   */
  public static shortid(size = 12): string {
    return Math.random().toString(36).substr(2, size);
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
   * Return a promise if not already a promise.
   *
   * @param something   Promise or Whatever
   * @return            Promise of anything
   */
  public static promise(something: any): Promise<any> {
    return (!!something && !!something.then)
      ? something
      : Promise.resolve(something);
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

    if (typeof type1.name === "string" && (type1.name === type2.name)) {
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
   * Run promises one by one.
   * Used for chained #onStart.
   *
   * @internal
   * @param promises    Array of promises
   */
  public static cascade(promises: Array<() => Promise<any>>) {
    const wait = (): Promise<any> => {
      if (promises.length > 0) {
        const func = promises.shift();
        if (!!func) {
          return _.promise(func()).then(() => wait());
        }
        return Promise.resolve();
      }
      return Promise.resolve();
    };
    return wait();
  }

  /**
   * Generic bubble sort.
   * Used for sorted kernel dependencies.
   *
   * @internal
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
   * Bubble sort declarations by requirement.
   * Used by #start() and #stop().
   */
  public static sortDeclarations(declarations: IDeclarations): IDeclarations {
    return _.bubble(declarations, (list, index) => {
      const findDefinitionInTree = (declaration: IAnyDeclaration, definition: Function) => {

        if (_.isEqualClass(declaration.definition, definition)) {
          return true;
        }

        for (const child of declaration.children) {
          const childDependency = declarations.find((d: IAnyDeclaration) =>
            _.isEqualClass(d.definition, child.type));
          if (!!childDependency && findDefinitionInTree(childDependency, definition)) {
            return true;
          }
        }

        return false;
      };
      return findDefinitionInTree(list[index], list[index + 1].definition);
    });
  }

  /**
   * Check if a definition can be named as IProvider.
   * Providers can't be injected after #start().
   * This function has been updated a lot of time since the beginning... :-D
   *
   * History:
   * - post2016: check only #onStart()
   * -  pre2017: check #onStart(),#onStop(),@state
   * - post2017: check #onStart(),#onStop(),#onConfigure()
   *
   * It's just a protection to avoid some shitty behavior.
   *
   * @param definition  Class definition
   */
  public static isProvider(definition: Function) {

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

/**
 * @alias
 */
export const _ = CommonUtil;
