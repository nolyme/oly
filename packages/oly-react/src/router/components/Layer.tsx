import * as React from "react";
import { Component, ReactNode } from "react";

const PropTypes = require("prop-types");

export interface ILayerProps {
  id: number;
}

/**
 * @internal
 */
export class Layer extends Component<ILayerProps, {}> {

  public static childContextTypes = {
    layer: PropTypes.number,
  };

  public getChildContext() {
    return {layer: this.props.id};
  }

  public render(): ReactNode {
    return this.props.children;
  }
}
