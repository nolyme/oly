import { _, IDecorator, Meta } from "oly-core";
import * as PropTypes from "prop-types";
import * as React from "react";
import { ComponentInjector } from "../services/ComponentInjector";

export class AttachDecorator implements IDecorator {

  public asClass(target: { contextTypes?: any; prototype?: any }): void {
    if (target && target.contextTypes && target.contextTypes.kernel) {
      return;
    }

    if (target.contextTypes) {
      target.contextTypes.kernel = PropTypes.object;
    } else {
      target.contextTypes = {kernel: PropTypes.object};
    }

    // patch react component hooks (stateful only)
    if (!!target.prototype) {

      // force Kernel#inject() before #componentWillMount()
      target.prototype.componentWillMount$$ = target.prototype.componentWillMount || _.noop;
      target.prototype.componentWillMount = function componentWillMount(this: React.Component<{}, {}>) {
        this.context.kernel.inject(ComponentInjector).inject(target, this);
        return target.prototype.componentWillMount$$.apply(this, arguments);
      };

      // try to clean event-listeners before componentWillUnmount
      target.prototype.componentWillUnmount$$ = target.prototype.componentWillUnmount || _.noop;
      target.prototype.componentWillUnmount = function componentWillUnmount(this: React.Component<{}, {}>) {
        this.context.kernel.inject(ComponentInjector).free(this);
        return target.prototype.componentWillUnmount$$.apply(this, arguments);
      };
    }
  }
}

/**
 * Link component to Kernel.
 *
 * **This is for React.Component only**.
 *
 *
 * Before `componentWillMount`, kernel will process the component:
 * - process @inject
 * - process @state/@env
 * - process @on
 *
 * Before `componentWillUnmount`, kernel will `__free__` all events of the component.
 *
 * ```ts
 * &shy;@attach
 * class Home extends Component<any, any> {
 *   @inject a: B; // this is allowed
 *
 *   render() { }
 * }
 * ```
 *
 * > Use @attach only if needed.
 */
export const attach = Meta.decoratorWithoutOptions(AttachDecorator);
