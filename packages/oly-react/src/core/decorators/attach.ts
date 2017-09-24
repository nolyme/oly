import { Global, IDecorator, Kernel, Meta } from "oly";
import * as PropTypes from "prop-types";
import * as React from "react";
import { ComponentInjector } from "../services/ComponentInjector";

export type InjectableComponent = React.Component<{}, {}> & { injected$$: boolean, context: { kernel: Kernel } };

export interface IAttachOptions {
  watch?: string[]; // events
  styles?: any;
}

export class AttachDecorator implements IDecorator {

  public constructor(private options: IAttachOptions = {}) {
  }

  public asClass(target: { contextTypes?: any; prototype?: any }): void {
    const self = this;

    if (target.contextTypes) {
      target.contextTypes.kernel = PropTypes.object;
    } else {
      target.contextTypes = {kernel: PropTypes.object};
    }

    // patch react component hooks (stateful only)
    if (!!target.prototype) {

      if (!!target.prototype.componentWillMount$$) {
        target.prototype.componentWillMount = target.prototype.componentWillMount$$;
        target.prototype.componentWillUnmount = target.prototype.componentWillUnmount$$;
      }

      // force Kernel#inject() before #componentWillMount()
      target.prototype.componentWillMount$$ = target.prototype.componentWillMount || Global.noop;
      target.prototype.componentWillMount = function componentWillMount(this: InjectableComponent) {
        if (!this.injected$$ && this.context.kernel) { // you can call #componentWillMount more than once now
          this.context.kernel.inject(ComponentInjector).inject(this.constructor, this, self.options);
          this.injected$$ = true;
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
 *
 * ### Watchers
 *
 * Component#forceUpdate() is called after each oly-state-mutation if the component relies on the state.
 *
 * ```ts
 * class MyProvider { @state("SUPER_STATE") myState: string }
 * class MyService { @inject p: MyProvider }
 *
 * class MyComponent extends React.Component {
 *   // component will use #forceUpdate on each "SUPER_STATE" mutation.
 *   @inject s: MyService;
 * }
 * ```
 *
 * Override the watchlist with @attach.
 *
 * ```ts
 * &shy;@attach({
 *   watch: ["SUPER_STATE"],
 * })
 * class MyComponent extends React.Component {
 *   render() { }
 * }
 * ```
 */
export const attach = Meta.decorator<IAttachOptions>(AttachDecorator);
