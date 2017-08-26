import { inject, Logger, on } from "oly";
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
   * By default, view is named `main` and chunks equal `{main: JSX}`.
   * Set another name will check another chunk name.
   *
   * ```ts
   * class A {
   *   @layout root() {
   *     return (
   *       <div>
   *         <View name="header"/>
   *         <View/>
   *       </div>
   *     );
   *   }
   *   @page index() {
   *     return {
   *       header: <Header/>,
   *       main: <App/>,
   *     };
   *   }
   * }
   * ```
   */
  name?: string;

  /**
   * When view is **updated**.
   *
   * You can use it to force scroll top.
   * ```ts
   * <div ref={(div) => el = div}>
   *   <View onChange={() => el.scrollTop = 0}/>
   * </div>
   * ```
   */
  onChange?: () => any;
}

/**
 * Display a JSX ReactRouterProvider layer.
 *
 * This is useful if you have nested routes.
 */
@attach({
  watch: [], // View does not need auto-watch
})
export class View extends Component<IViewProps, { content: any }> {

  public static contextTypes = {
    layer: PropTypes.number,
  };

  @inject
  public logger: Logger;

  @inject
  public routerProvider: ReactRouterProvider;

  public index: number;

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
      this.logger.trace(`update view ${this.index} (${this.name})`);
      return new Promise<void>((resolve) => this.setState({content: this.content}, () => {
        resolve();
        if (typeof this.props.onChange === "function") {
          this.props.onChange();
        }
      }));
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
    this.logger.trace(`init view ${this.index} (${this.name})`);
    this.state = {
      content: this.content,
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
    if (this.content) {
      this.logger.trace(`render view ${this.index} (${this.name})`);
      return this.content;
    }
    if (this.props.children) {
      return Children.only(this.props.children);
    }
    return null;
  }
}
