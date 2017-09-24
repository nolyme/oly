import { IDecorator, Meta } from "oly";
import { olyMapperKeys } from "../constants/keys";
import { IField, IType } from "../interfaces";

export class FieldDecorator implements IDecorator {

  private options: Partial<IField>;

  public constructor(options: Partial<IField> | IType = {}) {
    this.options = typeof options === "function" ? {type: options} : options;
  }

  public asProperty(target: object, propertyKey: string): void {

    const type = this.options.type || Meta.designType(target, propertyKey);

    Meta.of({key: olyMapperKeys.fields, target, propertyKey}).set({
      name: this.options.name || propertyKey,
      required: this.options.required !== false,
      type,
      ...this.options,
    });
  }
}

/**
 * ```ts
 * class Embedded {
 *   @field title: string;
 * }
 *
 * class Data {
 *   @field firstName: string;
 *   @field lastName: string;
 *   @field age: number;
 *   @field something: Embedded;
 * }
 * ```
 *
 * ### JSON Schema
 *
 * ```ts
 * class Data {
 *
 *   @field({
 *     // json-schema options like minLength, ...
 *     // "required" is also available
 *   })
 *   propertyKey: string;
 * }
 *
 * json.schema(Data); // {properties: {...
 * ```
 *
 * ### Type
 *
 * Mapping requires a "Type", most of the time TypeScript type annotations are enough.
 *
 * Exceptions:
 * - array (see @array)
 * - native type (see @date)
 *
 * ### Required by default
 *
 * Like a Typescript property, **a @field property is required by default**.
 *
 * ```ts
 * class A {
 *   @field({required: false}) myProperty?: string; // now it's optional
 * }
 * ```
 */
export const field = Meta.decorator<Partial<IField> | IType>(FieldDecorator);
