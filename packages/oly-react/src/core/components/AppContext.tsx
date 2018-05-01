import { Kernel } from "oly";
import * as React from "react";
import { ReactNode } from "react";

const PropTypes = require("prop-types");

/**
 *
 */
export interface IAppContextProps {
  kernel: Kernel;
}

/**
 * Add an oly Kernel to `childContext`.
 * See ReactBrowserProvider and ReactServerProvider.
 *
 * ```ts
 * Kernel
 *  .create(store)
 *  .with(...deps)
 *  .start()
 *  .then(kernel =>
 *    render(<AppContext kernel={kernel}><MyApp/></AppContext>, rootElement)
 *  );
 * ```
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
  public render(): ReactNode {
    return this.props.children;
  }
}
