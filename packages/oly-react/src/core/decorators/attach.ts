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
 *
 */
export const attach = Meta.decoratorWithoutOptions(AttachDecorator);
