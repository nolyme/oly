import { IDecorator, Meta } from "oly-core";
import { olyMapperKeys } from "../constants/keys";
import { IField, IType } from "../interfaces";

export class FieldDecorator implements IDecorator {

  private options: Partial<IField>;

  public constructor(options: Partial<IField> | IType = {}) {
    this.options = typeof options === "function" ? {type: options} : options;
  }

  public asProperty(target: object, propertyKey: string): void {
    Meta.of({key: olyMapperKeys.fields, target, propertyKey}).set({
      name: this.options.name || propertyKey,
      required: this.options.required !== false,
      type: this.options.type || Meta.designType(target, propertyKey),
      ...this.options,
    });
  }
}

/**
 * Attach a TypeScript property to a JsonSchema property.
 *
 * ```
 * class A {
 *   @field({
 *    // json-schema options like minLength, ...
 *    // "required" is also available
 *   })
 *   myProperty: string;
 * }
 * ```
 *
 * Mapping requires a "type", most of the time TypeScript type is enough.
 * Exceptions:
 * - array (see @array)
 * - native type (see @date)
 *
 * Like a Typescript property, @field property is required by default.
 *
 * ```ts
 * class A {
 *   @field({required: false}) myProperty?: string; // now it's optional
 * }
 * ```
 */
export const field = Meta.decorator<Partial<IField> | IType>(FieldDecorator);
