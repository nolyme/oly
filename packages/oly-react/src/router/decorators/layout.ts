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
 * It's like @page but with:
 * - abstract = true
 * - layout = true
 *
 *
 * All other pages of the class will become "child" of this method.
 * Use &lt;View/&gt; to display the child layer.
 *
 *
 * > You can define only once @layout by class.
 *
 *
 * ```ts
 * class A {
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
