import { Meta } from "oly";
import { IPageOptions, PageDecorator } from "./page";

export class LayoutDecorator extends PageDecorator {
  public asMethod(target: object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>): void {
    this.options.abstract = true;
    this.options.layout = true;
    super.asMethod(target, propertyKey, descriptor);
  }
}

/**
 * It's @page with `{abstract: true, layout: true}`.
 *
 * > Only one @layout by class.
 *
 * All other pages of the class will become a "child" of this method.<br/>
 * Use &lt;View/&gt; to display the child layer.
 *
 * ```ts
 * class A {
 *
 *   @layout
 *   root() { return <View/>; }
 *
 *   @page("/")
 *   home() { return <div>home</div>; }
 *
 *   @page("/about")
 *   about() { return <div>about</div>; }
 * }
 * ```
 */
export const layout = Meta.decorator<string | IPageOptions>(LayoutDecorator);
