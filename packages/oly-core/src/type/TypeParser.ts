export class TypeParser {

  public static parse(as: Function, something: any): any {
    if (typeof as === "function") {
      switch (as) {
        case Boolean:
          return this.parseBoolean(something);
        case String:
          return this.parseString(something);
        case Number:
          return this.parseNumber(something);
        default:
          return this.parseObject(something);
      }
    }

    return something;
  }

  public static parseBoolean(value: any): boolean {
    if (typeof value === "string") {
      return !(value === "" || value === "0" || value === "false");
    }
    return !!value;
  }

  public static parseNumber(value: any): number | null {
    if (value === "" || value == null) {
      return null;
    }
    return Number(value);
  }

  public static parseObject(value: any): object | null {
    if (!value) {
      return null;
    }
    if (typeof value === "number" || typeof value === "boolean") {
      return {};
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

  public static parseString(value: any): string | null {
    if (value != null) {
      if (typeof value === "object") {
        try {
          return JSON.stringify(value);
        } catch (e) {
          //
        }
      }
      return value.toString();
    }
    return null;
  }

}
