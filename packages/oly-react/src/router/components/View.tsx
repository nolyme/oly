import { env, inject, Logger, on } from "oly-core";
import * as PropTypes from "prop-types";
import * as React from "react";
import { Children, Component } from "react";
import { attach } from "../../core/decorators/attach";
import { olyReactEvents } from "../constants/events";
import { ILayer } from "../interfaces";
import { ReactRouterProvider } from "../services/ReactRouterProvider";

/**
 *
 */
export interface IViewProps {

  /**
   * Force layer id.
   */
  index?: number;

  /**
   *
   */
  name?: string;
}

export interface IViewState {

  /**
   *
   */
  content: JSX.Element | null;
}

/**
 *
 */
@attach
export class View extends Component<IViewProps, IViewState> {

  public static contextTypes = {
    layer: PropTypes.number,
  };

  @env("OLY_REACT_SHOW_VIEWS")
  public readonly show: boolean = false;

  @inject(Logger)
  public logger: Logger;

  @inject(ReactRouterProvider)
  public routerProvider: ReactRouterProvider;

  public index: number;

  public get name(): string {
    return this.props.name || "main";
  }

  public get layer(): ILayer | null {
    return this.routerProvider.layers[this.index];
  }

  /**
   * Refresh the chunk here
   */
  @on(olyReactEvents.TRANSITION_END)
  public onTransitionEnd(): void {
    if (this.layer && this.layer.chunks[this.name] !== this.state.content) {
      this.logger.trace(`update view ${this.index} (${this.name})`);
      this.setState({
        content: this.layer.chunks[this.name],
      });
    }
  }

  /**
   *
   */
  public componentWillMount(): void {
    this.index = (this.props.index != null ? this.props.index : this.context.layer) || 0;
    this.logger.trace(`init view ${this.index} (${this.name})`);
    this.state = {
      content: this.layer ? this.layer.chunks[this.name] : null,
    };
  }

  /**
   *
   */
  public componentWillUnmount(): void {
    this.logger.trace(`destroy view ${this.index} (${this.name})`);
  }

  /**
   *
   */
  public render(): JSX.Element | null {
    if (this.state.content) {
      this.logger.trace(`render view ${this.index} (${this.name})`);
      if (this.show) {
        return (
          <fieldset>
            <legend>Layer[{this.index}].{this.name}</legend>
            {this.state.content}
          </fieldset>
        );
      }
      return this.state.content;
    }
    if (this.props.children) {
      return Children.only(this.props.children);
    }
    return null;
  }
}
