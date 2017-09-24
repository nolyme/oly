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
 * Alias of @field.
 *
 * ```ts
 * class Data {
 *
 *   @field({
 *     type: Array,
 *     of: {
 *       type: User,
 *     },
 *   })
 *   users: User[];
 *
 *   @array({
 *     of: Movie // mandatory
 *   })
 *   movies: Movie[];
 * }
 * ```
 */
export const array = Meta.decoratorWithOptions<IMetaArray>(ArrayDecorator);
