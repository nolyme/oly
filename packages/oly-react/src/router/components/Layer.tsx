import * as PropTypes from "prop-types";
import * as React from "react";
import { Children, Component } from "react";

/**
 *
 */
export interface ILayerProps {
  id: number;
}

/**
 *
 */
export class Layer extends Component<ILayerProps, {}> {

  public static childContextTypes = {
    layer: PropTypes.number,
  };

  /**
   *
   */
  public getChildContext() {
    return {layer: this.props.id};
  }

  /**
   *
   */
  public render(): JSX.Element | null {
    return Children.only(this.props.children);
  }
}
