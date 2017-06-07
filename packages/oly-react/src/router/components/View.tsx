import { _, env, inject, Logger, on } from "oly-core";
import * as PropTypes from "prop-types";
import * as React from "react";
import { Children, Component } from "react";
import { attach } from "../../core/decorators/attach";
import { olyReactRouterEvents } from "../constants/events";
import { ILayer, ITransitionRenderEvent } from "../interfaces";
import { ReactRouterProvider } from "../providers/ReactRouterProvider";

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

/**
 *
 */
@attach
export class View extends Component<IViewProps, { content: any }> {

  public static contextTypes = {
    layer: PropTypes.number,
  };

  @env("OLY_REACT_SHOW_VIEWS")
  public readonly show: boolean = false;

  @inject
  public logger: Logger;

  @inject
  public routerProvider: ReactRouterProvider;

  public index: number;

  public id = _.shortid();

  public get name(): string {
    return this.props.name || "main";
  }

  public get layer(): ILayer | undefined {
    return this.routerProvider.layers[this.index];
  }

  public get content(): JSX.Element | undefined {
    return this.layer ? this.layer.chunks[this.name] : undefined;
  }

  /**
   * Refresh the chunk here
   */
  @on(olyReactRouterEvents.TRANSITION_RENDER)
  public onTransitionRender({level}: ITransitionRenderEvent): Promise<void> {
    if (this.layer
      && level === this.index
      && this.content !== this.state.content) {
      this.logger.trace(`update view ${this.id} ${this.index} (${this.name})`);
      return new Promise<void>((resolve) =>
        this.setState({content: this.content}, () => resolve()),
      );
    }
    return Promise.resolve();
  }

  /**
   *
   */
  public componentWillMount(): void {
    this.index = (this.props.index != null ? this.props.index : this.context.layer);
    if (typeof this.index === "undefined") {
      throw new Error("Can't get an index");
    }
    this.logger.trace(`init view ${this.id} ${this.index} (${this.name})`);
    this.state = {
      content: this.content,
    };
  }

  /**
   *
   */
  public componentWillUnmount(): void {
    this.logger.trace(`destroy view ${this.id} ${this.index} (${this.name})`);
  }

  /**
   *
   */
  public render(): JSX.Element | null {
    if (this.content) {
      this.logger.trace(`render view ${this.id} ${this.index} (${this.name})`);
      if (this.show) {
        const node = this.routerProvider.layers[this.index].node;
        return (
          <details style={{boxShadow: "inset 0 0 0 1px rgba(128, 128, 128, 0.3)"}}>
            <summary
              style={{padding: "4px", background: "grey", color: "white", cursor: "pointer"}}
            >
              layer[{this.index}].{this.name}: {_.identity(node.target, node.propertyKey)}
            </summary>
            <div style={{padding: "10px"}}>
              {this.content}
            </div>
          </details>
        );
      }
      return this.content;
    }
    if (this.props.children) {
      return Children.only(this.props.children);
    }
    return null;
  }
}
