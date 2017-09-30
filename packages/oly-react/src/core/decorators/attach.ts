import { Global, IDecorator, Kernel, Meta } from "oly";
import * as PropTypes from "prop-types";
import * as React from "react";
import { ComponentInjector } from "../services/ComponentInjector";

export type InjectableComponent = React.Component<{}, {}> & { injected$$: boolean, context: { kernel: Kernel } };

export interface IAttachOptions {
  /**
   * @deprecated Use Component.prototype.watchlist
   */
  watch?: string[];
  /**
   * @deprecated
   */
  styles?: any;
}

export class AttachDecorator implements IDecorator {

  public asClass(target: { contextTypes?: any; prototype?: any }): void {
    const self = this;

    if (!!target.contextTypes) {
      target.contextTypes.kernel = PropTypes.object;
    } else {
      target.contextTypes = {kernel: PropTypes.object};
    }

    // patch react component hooks (stateful only)
    if (!!target.prototype) {

      if (!!target.prototype.componentWillMount$$) {
        return;
      }

      // force Kernel#inject() before #componentWillMount()
      target.prototype.componentWillMount$$ = target.prototype.componentWillMount || Global.noop;
      target.prototype.componentWillMount = function componentWillMount(this: InjectableComponent) {
        if (this.context.kernel) {
          this.context.kernel.inject(ComponentInjector).inject(this.constructor, this);
        }
        return target.prototype.componentWillMount$$.apply(this, arguments);
      };

      // try to clean event-listeners before componentWillUnmount
      target.prototype.componentWillUnmount$$ = target.prototype.componentWillUnmount || Global.noop;
      target.prototype.componentWillUnmount = function componentWillUnmount(this: InjectableComponent) {
        if (this.context.kernel) {
          this.context.kernel.inject(ComponentInjector).free(this);
        }
        return target.prototype.componentWillUnmount$$.apply(this, arguments);
      };
    }
  }
}

/**
 * Connect a stateful component to an oly Kernel of the React context. This is OPTIONAL.
 *
 * ```ts
 * &shy;@attach
 * class MyComponent extends React.Component {
 *   render() { }
 * }
 * ```
 *
 * ### Auto
 *
 * All decorators @inject, @state, ... already use @attach.
 *
 * ```ts
 * &shy;@attach
 * class MyComponent extends React.Component {
 *   @inject a: B;
 *   render() { }
 * }
 * // same
 * class MyComponent extends React.Component {
 *   @inject a: B;
 *   render() { }
 * }
 * ```
 */
export const attach = Meta.decorator<IAttachOptions>(AttachDecorator);
