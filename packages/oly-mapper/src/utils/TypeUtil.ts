export class TypeUtil {

  public static forceBoolean(value: any): boolean {
    if (typeof value === "string") {
      return value === "true";
    }
    return !!value;
  }

  public static forceNumber(value: any): number {
    if (typeof value === "number") {
      return value;
    }
    return Number(value);
  }

  public static forceString(value: any): string {
    if (value && value.toString) {
      return value.toString();
    }
    return String(value);
  }

  public static forceObject(value: any): object {
    if (typeof value === "object") {
      return value;
    } else if (typeof value === "string") {
      return JSON.parse(value);
    }
    throw new Error(`You can force ${typeof value} into object`);
  }
}
