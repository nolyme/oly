import { Meta } from "oly";
import { IMetaArray } from "../interfaces";
import { FieldDecorator } from "./field";

export class ArrayDecorator extends FieldDecorator {

  public constructor(options: IMetaArray) {
    super({
      type: Array,
      ...options,
    });
  }
}

/**
 * It's like @field + embedded list of @field.
 *
 * ```ts
 * class A {
 *   @array({of: String}) myProp: string[];
 *   @array({of: Data}) myProp2: Data[];
 * }
 * ```
 */
export const array = Meta.decoratorWithOptions<IMetaArray>(ArrayDecorator);
