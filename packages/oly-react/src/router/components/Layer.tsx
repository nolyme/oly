import * as React from "react";
import { Component } from "react";

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

  public render(): JSX.Element | null {
    return this.props.children as any;
  }
}
