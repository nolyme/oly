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

export const date = Meta.decorator<Partial<IField>>(DateDecorator);
