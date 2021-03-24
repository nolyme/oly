import { inject, Logger, on } from "oly";
import * as PropTypes from "prop-types";
import * as React from "react";
import { Component, ReactNode } from "react";
import { attach } from "../../core/decorators/attach";
import { olyReactRouterEvents } from "../constants/events";
import { ILayer, ITransitionRenderEvent } from "../interfaces";
import { ReactRouterProvider } from "../providers/ReactRouterProvider";
import {LayerContext} from "./Layer";

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
 * Display the result of a @page.
 *
 * ```ts
 * class App {
 *   @layout root = () =>
 *    <div>
 *      <Go to="/">page1</Go>
 *      <Go to="page2">page2</Go>
 *      <View/>
 *    </div>;
 *
 *   @page("/")  page1     = () => <p>1</p>;
 *   @page("/2") page2     = () => <p>2</p>;
 *   @page("/*") notFound  = () => <p>notFound</p>;
 *   @page       error     = () => <p>Boom</p>;
 * }
 * ```
 */
@attach
export class View extends Component<IViewProps, { content: any }> {

  @inject
  private logger: Logger;

  @inject
  private routerProvider: ReactRouterProvider;

  private index: number;

  private watchlist: string[] = [];

  private contextLayer: number = 0;

  private get name(): string {
    return this.props.name || "main";
  }

  private get layer(): ILayer | undefined {
    return this.routerProvider.layers[this.index];
  }

  private get content(): JSX.Element | undefined {
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
  public componentDidMount(): void {
    this.index = (this.props.index != null ? this.props.index : this.contextLayer);
    if (typeof this.index === "undefined") {
      throw new Error("Can't get an index");
    }
    this.logger.trace(`init view ${this.index} (${this.name})`);
    this.setState({
      content: this.content,
    });
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
  public render_old(): ReactNode {
    if (this.content) {
      this.logger.trace(`render view ${this.index} (${this.name})`);
      return this.content;
    }

    if (this.props.children == null) {
      return null;
    }

    return this.props.children;
  }

  public render(): ReactNode {
    if (this.content) {
      this.logger.trace(`render view ${this.index} (${this.name})`);
      return this.content;
    }

    if (this.props.children == null) {
      return null;
    }

    return (
        <LayerContext.Consumer>
        {
          layer => {
            this.contextLayer = layer;
            return this.render_old();
          }
        }
        </LayerContext.Consumer>
    );
  }
}
