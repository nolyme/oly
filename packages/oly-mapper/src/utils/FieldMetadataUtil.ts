import { IAnyFunction, IClass, MetadataUtil } from "oly-core";
import { FieldType, IField, IType } from "../interfaces";

export class FieldMetadataUtil {

  public static lyFields = "ly:fields";

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

  /**
   *
   * @param Target
   * @return {any}
   */
  public static hasFields(Target: IClass | IAnyFunction): boolean {
    return MetadataUtil.has(FieldMetadataUtil.lyFields, Target);
  }

  /**
   *
   * @param Target
   * @return {any}
   */
  public static getFields(Target: IClass | IAnyFunction): IField[] {
    return MetadataUtil.deep(FieldMetadataUtil.lyFields, Target, []);
  }
}
