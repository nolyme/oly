import { Meta } from "oly-core";
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
 * Like @field + {format: "date-time", type: Date}. Nothing more.
 * This is recommended for all @field date: Date as TypeScript decorators can't extract native Date type.
 */
export const date = Meta.decorator<Partial<IField>>(DateDecorator);
