import { IAnyFunction, IClass, MetadataUtil } from "oly-core";
import { FieldType, IField } from "../interfaces";

export class FieldMetadataUtil {

  public static lyFields = "ly:fields";

  /**
   *
   * @param type
   * @return {any}
   */
  public static findTypeName(type?: IAnyFunction | null): FieldType {

    if (type == null) {
      return "any";
    }

    switch (type) {
      case String:
        return "string";
      case Number:
        return "number";
      case Boolean:
        return "boolean";
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
