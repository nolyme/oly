import { IndexOptions } from "mongodb";
import { IDecorator, Meta } from "oly-core";
import { olyMongoKeys } from "../constants/keys";
import { IIndexProperty } from "../interfaces";

export type IIndexOptions = IIndexProperty;

export class IndexDecorator implements IDecorator {

  public constructor(private options: IIndexOptions) {
  }

  public asProperty(target: object, propertyKey: string): void {
    Meta.of({
      key: olyMongoKeys.indexes,
      target,
      propertyKey,
    }).set(this.options);
  }
}

export const index = Meta.decorator<IndexOptions>(IndexDecorator);
