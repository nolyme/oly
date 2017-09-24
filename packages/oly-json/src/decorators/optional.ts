import { Meta } from "oly";
import { IField } from "../interfaces";
import { FieldDecorator } from "./field";

export class OptionalDecorator extends FieldDecorator {

  public constructor(options: Partial<IField> = {}) {
    super({
      required: false,
      ...options,
    });
  }
}

/**
 * Alias of @field.
 *
 * ```ts
 * class Data {
 *
 *   @field({
 *     required: false,
 *   })
 *   firstName: string;
 *
 *   @optional lastName: string;
 * }
 * ```
 */
export const optional = Meta.decorator<Partial<IField>>(OptionalDecorator);
