import { IDecorator, inject, Meta } from "oly";
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
 * Create a new React route.
 *
 * ```ts
 * class Pages {
 *
 *   @page("/")
 *   home() {
 *     return <div>Home</div>;
 *   }
 * }
 * ```
 *
 * ### Transition
 *
 * ```ts
 * class Pages {
 *
 *   @page("/")
 *   home(tr: ITransition) {
 *
 *     console.log(tr.from);
 *     console.log(tr.to);
 *
 *     return <div>Home</div>;
 *   }
 * }
 * ```
 *
 * Do not use Router#current here but `tr.from` and `tr.to`.
 *
 * ### Children
 *
 * ```ts
 * class ChildPages {
 *   @page("/")      index = () => <h1>Index</h1>
 *   @page("/about") about = () => <h1>About</h1>
 * }
 *
 * class Pages {
 *
 *   @page({
 *     path: "/c",
 *     children: [ChildPages]
 *   })
 *   root() {
 *     return <View/>;
 *   }
 * }
 * ```
 *
 * ### Not Found ?
 *
 *
 */
export const page = Meta.decorator<string | IPageOptions>(PageDecorator);
