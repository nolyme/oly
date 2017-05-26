import { _ } from "oly-core";
import * as React from "react";
import { ComponentInjector } from "../services/ComponentInjector";

const PropTypes = require("prop-types"); // tslint:disable-line

/**
 * Add kernel contextTypes and process decorators on "componentWillMount".
 *
 * ```typescript
 *  @attach
 * class A extends React.Component<{}, {}> {
 *   render() { return <div></div>; }
 * }
 * ```
 */
export const attach = (target: React.ComponentClass<any> | React.StatelessComponent<any>): any => {

  if (target && target.contextTypes && target.contextTypes.kernel) {
    return target;
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
      this.context.kernel.get(ComponentInjector).inject(target, this);
      return target.prototype.componentWillMount$$.apply(this, arguments);
    };

    // try to clean event-listeners before componentWillUnmount
    target.prototype.componentWillUnmount$$ = target.prototype.componentWillUnmount || _.noop;
    target.prototype.componentWillUnmount = function componentWillUnmount(this: React.Component<{}, {}>) {
      this.context.kernel.get(ComponentInjector).free(this);
      return target.prototype.componentWillUnmount$$.apply(this, arguments);
    };
  }

  return target;
};

/**
 * @alias
 */
export const connect = attach;
