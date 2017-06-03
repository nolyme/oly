import { IDecorator, inject, Meta } from "oly-core";
import { olyReactRouterKeys } from "../constants/keys";

/**
 * Page options.
 */
export interface IPageOptions {
  path?: string;
  children?: Function[];
  data?: any;
  name?: string;
  abstract?: boolean;
}

export class PageDecorator implements IDecorator {

  private options: IPageOptions;

  public constructor(options: string | IPageOptions = {}) {
    if (typeof options === "string") {
      this.options = {path: options};
    } else {
      this.options = options;
    }
  }

  public asMethod(target: object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>): void {

    if (this.options.children) {
      // we secretly inject nested views inside parent, niark niark niark
      // this is useful when child depends on providers
      for (const child of this.options.children || []) {
        inject(child)(target, `${child.name}$auto`);
      }
    }

    Meta.of({key: olyReactRouterKeys.pages, target, propertyKey}).set({
      abstract: this.options.abstract === true,
      children: this.options.children,
      name: this.options.name || propertyKey,
      path: this.options.path || "",
    });
  }

  public asProperty(target: object, propertyKey: string): void {
    this.asMethod(target, propertyKey, {});
  }
}

export const page = Meta.decorator<string | IPageOptions>(PageDecorator);
