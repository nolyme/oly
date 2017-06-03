import { Meta } from "oly-core";
import { IMetaArray } from "../interfaces";
import { FieldDecorator } from "./field";

export class ArrayDecorator extends FieldDecorator {

  public constructor(options: IMetaArray) {
    super({
      ...options,
      type: Array,
    });
  }
}

export const array = Meta.decoratorWithOptions<IMetaArray>(ArrayDecorator);
