import { Class, inject, Kernel, Meta, TypeParser } from "oly";
import { olyMapperKeys } from "../constants/keys";
import { IField, IFieldsMetadata } from "../interfaces";
import { TypeUtil } from "../utils/TypeUtil";

export class JsonMapper {

  @inject
  protected kernel: Kernel;

  /**
   * Map object to class based on definition.
   *
   * @param definition      Class definition
   * @param source          Json object data
   */
  public mapClass<T>(definition: Class<T>, source: object): T {

    const obj = source instanceof definition
      ? this.kernel.inject(definition, {instance: source as any})
      : this.kernel.inject(definition, {register: false});

    const fieldsMetadata = Meta.of({key: olyMapperKeys.fields, target: definition}).deep<IFieldsMetadata>();
    if (fieldsMetadata) {

      const keys = Object.keys(fieldsMetadata.properties);
      for (const propertyKey of keys) {
        const field = fieldsMetadata.properties[propertyKey];
        const key = field.name;
        if (source[key] != null) {
          obj[key] = this.mapField(field, source[key]);
        }
      }
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

    const type = TypeUtil.getFieldType(field.type);
    if (type === "array") {
      return this.mapArray(field, value);
    } else if (type === "object" && typeof field.type === "function") {
      return this.mapObject(field, value);
    } else if (type === "boolean") {
      return TypeParser.parseBoolean(value);
    } else if (type === "number") {
      return TypeParser.parseNumber(value);
    } else if (type === "string") {
      return TypeParser.parseString(value);
    } else {
      // nothing to do (null & any)
      return value;
    }
  }

  /**
   *
   * @param field
   * @param value
   * @return
   */
  public mapArray(field: IField, value: any): any[] {
    if (Array.isArray(value) && !!field.of) {
      const item = typeof field.of === "function"
        ? {type: field.of, name: ""}
        : {
          name: "",
          type: Object,
          ...field.of,
        };
      return value.map((v) => this.mapField(item, v));
    }
    return TypeParser.parseArray(value);
  }

  /**
   *
   * @param field
   * @param value
   * @return
   */
  public mapObject(field: IField, value: any): object {

    const definition = field.type as Class;

    if (typeof field.type === "function") {

      if (Meta.of({key: olyMapperKeys.fields, target: definition}).has()) {
        return this.mapClass(definition, value);
      } else if (definition === Object) {
        // if you have set an interface, but THIS IS UGLY
        const r = TypeParser.parseObject(value);
        if (typeof r !== "object") {
          throw new Error(
            `Can't map '${field.name}' into an object, `
            + `it is not a ${typeof value} and we have no information about this field.\n       `
            + `Use @field({type: <Class>}) for a real auto-cast like Date or use @field({map: a => b})`);
        }
      } else {
        return new definition(value);
      }
    } else if (typeof value === "object") {
      return value;
    }

    if (field.type === Object) {
      return value;
    }

    throw new Error(
      `Can't cast '${field.name}' into object. Value is not an object and field is '${typeof field.type}'`);
  }
}
