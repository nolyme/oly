import { Kernel } from "oly";
import * as PropTypes from "prop-types";
import * as React from "react";
import { Children } from "react";

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
  public render(): JSX.Element | null {
    if (!this.props.children) {
      return null;
    }
    if (Array.isArray(this.props.children)) {
      return <div>{this.props.children}</div>;
    }
    return Children.only(this.props.children);
  }
}
