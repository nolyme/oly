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

export const optional = Meta.decorator<Partial<IField>>(OptionalDecorator);
