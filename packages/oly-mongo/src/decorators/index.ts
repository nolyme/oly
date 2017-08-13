import { IDecorator, Meta } from "oly-core";
import { olyMongoKeys } from "../constants/keys";
import { IIndexProperty } from "../interfaces";

export class IndexDecorator implements IDecorator {

  public constructor(public options: Partial<IIndexProperty> = {}) {
  }

  public asProperty(target: Object, propertyKey: string): void {
    Meta
      .of({target, propertyKey, key: olyMongoKeys.indexes})
      .set(this.options);
  }
}

/**
 * Index a field.
 */
export const index = Meta.decorator<Partial<IIndexProperty>>(IndexDecorator);
