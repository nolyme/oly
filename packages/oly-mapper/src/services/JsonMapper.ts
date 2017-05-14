import { IClass, IClassOf } from "oly-core";
import { IField } from "../interfaces";
import { FieldMetadataUtil } from "../utils/FieldMetadataUtil";
import { TypeUtil } from "../utils/TypeUtil";

export class JsonMapper {

  /**
   * Map object to class based on definition.
   *
   * @param definition      Class definition
   * @param source          Json object data
   */
  public mapClass<T>(definition: IClassOf<T>, source: object): T {
    const obj = new definition();
    const fields = FieldMetadataUtil.getFields(definition);
    for (const field of fields) {
      const key = field.name;
      obj[key] = this.mapField(field, source[key]);
    }
    return obj;
  }

  /**
   * Map a field.
   *
   * @param field     Field definition
   * @param value     Source value
   * @return          The new mapped value
   */
  public mapField(field: IField, value: any): any {
    if (typeof field.map === "function") {
      return field.map(value);
    }

    const type = FieldMetadataUtil.getFieldType(field.type);
    if (type === "array" && !!field.of && Array.isArray(value)) {
      const item = typeof field.of === "function" ? {type: field.of, name: ""} : field.of;
      return value.map((v) => this.mapField(item, v));
    } else if (type === "object" && typeof field.type === "function") {
      const definition = field.type as IClass;
      if (FieldMetadataUtil.hasFields(definition)) {
        return this.mapClass(definition, value);
      } else if (definition === Object) {
        // if you have set an interface, but THIS IS UGLY
        try {
          return TypeUtil.forceObject(value);
        } catch (e) {
          throw new Error(
            `You can't map '${field.name}' into an object, `
            + `it's a fucking ${typeof value} and we have no information about this field.\n       `
            + `Set @field({type: Class}) for a real auto-cast like Date or use @field({map: a => b})`);
        }
      } else {
        return new definition(value);
      }
    } else if (type === "boolean") {
      return TypeUtil.forceBoolean(value);
    } else if (type === "number") {
      return TypeUtil.forceNumber(value);
    } else if (type === "string") {
      return TypeUtil.forceString(value);
    } else {
      // nothing to do
      return value;
    }
  }
}
