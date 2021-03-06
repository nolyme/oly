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
    if (this.props.children == null) {
      return null;
    }

    return this.props.children;
  }
}

export const LayerContext = React.createContext(0);
