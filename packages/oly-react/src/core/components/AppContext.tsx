import { Kernel } from "oly-core";
import * as React from "react";

const PropTypes = require("prop-types"); // tslint:disable-line

/**
 *
 */
export interface IAppContextProps {
  kernel: Kernel;
}

/**
 * Simply wrapper to inject Kernel into React Context.
 */
export class AppContext extends React.Component<IAppContextProps, {}> {

  /**
   * Declare kernel to React Context
   */
  public static childContextTypes = {
    kernel: PropTypes.object.isRequired,
  };

  /**
   * Attach kernel to React Context
   */
  public getChildContext(): IAppContextProps {
    return {
      kernel: this.props.kernel,
    };
  }

  /**
   * Render children
   */
  public render() {
    if (Array.isArray(this.props.children)) {
      return <div>{this.props.children}</div>;
    }
    return this.props.children as any;
  }
}
