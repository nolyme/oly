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
 * Alias of @page.
 *
 * ```ts
 * class Pages {
 *   @field({
 *     abstract: true,
 *     layout: true,
 *   })
 *   root() { }
 *   // same
 *   @layout root2() {}
 * }
 * ```
 *
 * All other pages of the class will become a "child" of this method.<br/>
 * Use &lt;View/&gt; to display the child layer.
 *
 * ```ts
 * class Pages {
 *
 *   @layout
 *   root() { return <View/>; } // View will display home or about or nothing
 *
 *   @page("/")
 *   home() { return <div>home</div>; }
 *
 *   @page("/about")
 *   about() { return <div>about</div>; }
 * }
 * ```
 *
 * With "modules".
 *
 * ```ts
 * class ModuleA {
 *   @layout("/a") a     = () => <View/>
 *   @page("/")    index = () => <h1>A:Index</h1>
 * }
 *
 * class MainModule {
 *   @layout({children: [ModuleA]}) root = () => <View/>
 * }
 * ```
 */
export const layout = Meta.decorator<string | IPageOptions>(LayoutDecorator);
