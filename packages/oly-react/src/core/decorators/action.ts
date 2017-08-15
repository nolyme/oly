import { Global, IDecorator, Meta } from "oly-core";
import { olyReactKeys } from "../constants/keys";

export interface IActionOptions {
  name?: string;
  prevent?: boolean;
  loading?: boolean;
  before?: object | Function;
  after?: object | Function;
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
 * Define a method as action.
 *
 * ```ts
 * class A extends Component<any, any> {
 *
 *   @action
 *   onClick(event) {
 *   }
 *
 *   render() {
 *     return (
 *       <button onClick={this.onClick}>ok</button>;
 *     );
 *   }
 * }
 * ```
 *
 * Action is "autobind".
 * There is an error handler.
 * The global event `ACTIONS_ERROR` is emitted on each error.
 */
export const action = Meta.decorator<IActionOptions>(ActionDecorator);
