import { FieldType, IType } from "../interfaces";

export class TypeUtil {

  /**
   * Find the correct field type based on JsonSchema spec.
   *
   * @param type    Function type
   * @return        string value of field type
   */
  public static getFieldType(type?: IType): FieldType {

    if (type == null) {
      return "null";
    }

    switch (type) {
      case String:
        return "string";
      case Number:
        return "number";
      case Boolean:
        return "boolean";
      case Array:
        return "array";
      default:
        return "object";
    }
  }

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
