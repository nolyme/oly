import { Meta } from "oly";
import { IField } from "../interfaces";
import { FieldDecorator } from "./field";

export class DateDecorator extends FieldDecorator {

  public constructor(options: Partial<IField> = {}) {
    super({
      format: "date-time",
      type: Date,
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
 *     type: Date,
 *     format: "date-time",
 *   })
 *   createdAt: Date;
 *
 *   @date updatedAt: Date;
 * }
 * ```
 *
 * [Date#toJSON()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toJSON)
 */
export const date = Meta.decorator<Partial<IField>>(DateDecorator);
