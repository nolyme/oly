import { IDecorator, inject, Meta } from "oly-core";
import { olyReactRouterKeys } from "../constants/keys";

/**
 * Page options.
 */
export interface IPageOptions {

  /**
   * Path match.
   */
  path?: string;

  /**
   * Create a new layer with all child nodes.
   */
  children?: Function[];

  /**
   * Wrap all other nodes of the class in children[].
   */
  layout?: boolean;

  /**
   * Node name. Default is the function name.
   */
  name?: string;

  /**
   * If true, node will not be accessible.
   */
  abstract?: boolean;
}

export class PageDecorator implements IDecorator {

  protected options: IPageOptions;

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
      layout: this.options.abstract === true,
      children: this.options.children,
      name: this.options.name || propertyKey,
      path: this.options.path || "",
    });
  }

  public asProperty(target: object, propertyKey: string): void {
    this.asMethod(target, propertyKey, {});
  }
}

/**
 * Define a new page.
 *
 * ```ts
 *  class A {
 *
 *    @page("/")
 *    home() {
 *      return <div>Home</div>
 *    }
 *  }
 * ```
 */
export const page = Meta.decorator<string | IPageOptions>(PageDecorator);
