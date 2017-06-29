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
}
