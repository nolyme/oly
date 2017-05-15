import { IType } from "../interfaces";

export class TypeUtil {

  public static isPrimitive(type: IType) {
    return type === Boolean || type === String || type === Number;
  }

  public static isArray(type: IType) {
    return type === Array;
  }

  public static isObject(type: IType) {
    return !this.isPrimitive(type) && !this.isArray(type);
  }

  public static force(type: IType, value: any): any {
    if (type === Boolean) {
      return this.forceBoolean(value);
    }
    if (type === Number) {
      return this.forceNumber(value);
    }
    if (type === String) {
      return this.forceString(value);
    }
    return value;
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
