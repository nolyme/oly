import { Global, IDecorator, Meta } from "oly";
import { olyReactKeys } from "../constants/keys";

export interface IActionOptions {
  name?: string;
  prevent?: boolean;
  loading?: boolean;
  before?: object | Function;
  after?: object | Function;
  lock?: boolean;
}

export class ActionDecorator implements IDecorator {

  private options: IActionOptions;

  public constructor(options: IActionOptions | string = {}) {
    if (typeof options === "string") {
      this.options = {name: options};
    } else {
      this.options = options;
    }
  }

  public asMethod(target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>): void {
    Meta.of({key: olyReactKeys.actions, target, propertyKey}).set({
      ...this.options,
      name: this.options.name || Global.identity(target, propertyKey),
    });
  }

  public asProperty(target: Object, propertyKey: string): void {
    this.asMethod(target, propertyKey, {});
  }
}

/**
 * Define a method as action. @action is based on @on.
 *
 * ```ts
 * class A extends Component {
 *   @inject http: PixieHttp;
 *
 *   @action
 *   async onClick() {
 *     const data = await this.http.get("/");
 *     this.setState({data});
 *   }
 *
 *   render() {
 *     return (
 *       <button onClick={this.onClick}>ok</button>
 *     );
 *   }
 * }
 *
 * // allowed
 * kernel.emit("A.onClick");
 * ```
 *
 * Method of @action is "autobind".
 *
 * ### Events
 *
 * The global event `oly:actions:begin` is emitted before each action. <br/>
 * The global event `oly:actions:error` is emitted on each error.      <br/>
 * The global event `oly:actions:success` is emitted on each success.
 *
 * > Tools like [Protrator](https://github.com/angular/protractor) or [Spectron](https://github.com/electron/spectron)
 * > can use this events as "next-tick".
 *
 * ### Prevent
 *
 * ```ts
 * class A {
 *
 *   @action({prevent: true}) // will call ev.stopPropagation() AND ev.preventDefault()
 *   onSubmit() {
 *   }
 * }
 * ```
 */
export const action = Meta.decorator<IActionOptions>(ActionDecorator);
