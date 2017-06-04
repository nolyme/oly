import { Meta } from "oly-core";
import { IPageOptions, PageDecorator } from "./page";

export class LayoutDecorator extends PageDecorator {
  public asMethod(target: object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>): void {
    this.options.abstract = true;
    this.options.layout = true;
    super.asMethod(target, propertyKey, descriptor);
  }
}

export const layout = Meta.decorator<string | IPageOptions>(LayoutDecorator);
