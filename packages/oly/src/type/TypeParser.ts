/**
 * Useful when combined with TypeScript type metadata.
 *
 * ```ts
 * class A {
 *   // if 'data' isn't controlled, we can't be sure about the type
 *   // TypeParser.parse(String, data) will ensure that data is always a string
 *   entry(data: string) {
 *
 *   }
 * }
 * ```
 *
 * Used by:
 * - oly (@env)
 * - oly-json (mapping)
 * - oly-react (@query, @param, ...)
 * - oly-api (@query, @param, ...)
 */
export class TypeParser {

  /**
   * Parse any value and try to transform into the given type.
   * A lot a works is already done by Javascript (like number conversion).
   *
   * ```ts
   * TypeParser.parse(Boolean, "true"); // true
   * ```
   *
   * @param as            Type (String, Boolean, Number, Object, Array)
   * @param something     Any value
   * @returns             The new parsed value as type or null
   */
  public static parse(as: Function, something: any): any {
    if (typeof as === "function") {
      switch (as) {
        case Boolean:
          return this.parseBoolean(something);
        case String:
          return this.parseString(something);
        case Number:
          return this.parseNumber(something);
        case Array:
          return this.parseArray(something);
        case Date:
          return new Date(something);
        default:
          return this.parseObject(something);
      }
    }

    return something;
  }

  /**
   * Transform any value into boolean.
   *
   * @param value
   * @returns       Always true or false.
   */
  public static parseBoolean(value: any): boolean {
    if (typeof value === "string") {
      return !(value === "" || value === "0" || value === "false");
    }
    return !!value;
  }

  /**
   * Transform any value into number.
   *
   * @param value     Any value
   * @returns         A number (NaN also) or null if parse has failed
   */
  public static parseNumber(value: any): number | undefined {
    if (value === "" || value == null) {
      return undefined;
    }
    return Number(value);
  }

  /**
   * Call toString() if possible.
   * If value is an object, we try JSON.stringify.
   *
   * @param value       Any value
   * @returns           A string or null if parse has failed
   */
  public static parseString(value: any): string | undefined {
    if (value != null) {
      if (typeof value === "object") {
        try {
          return JSON.stringify(value);
        } catch (e) {
          // ignore
        }
      }
      return value.toString();
    }
    return undefined;
  }

  /**
   * Ensure value is a object.
   *
   * @param value       Any value
   * @returns           An object or null
   */
  public static parseObject(value: any): object | undefined {
    if (!value) {
      return undefined;
    }
    if (typeof value === "number" || typeof value === "boolean") {
      return {}; // TODO: {} or undefined ?
    }
    if (typeof value === "string") {
      try {
        const result = JSON.parse(value);
        if (typeof result === "object") {
          return result;
        }
        return {};
      } catch (e) {
        return {};
      }
    }
    return value;
  }

  /**
   * Ensure array.
   *
   * @param value
   * @returns {any[]}
   */
  public static parseArray(value: any): any[] {
    if (Array.isArray(value)) {
      return value;
    }
    if (value === null || value === undefined) {
      return [];
    }
    if (typeof value === "string") {
      if (value.charAt(0) === "[" && value.charAt(value.length - 1) === "]") {
        try {
          return JSON.parse(value);
        } catch (e) {
          // ignore
        }
      }
    }
    return [value];
  }
}
