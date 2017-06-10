import { inject, on } from "oly-core";
import * as React from "react";
import { Component, createElement, HTMLAttributes } from "react";
import { action } from "../../core/decorators/action";
import { attach } from "../../core/decorators/attach";
import { olyReactRouterEvents } from "../constants/events";
import { Router } from "../services/Router";

/**
 *
 */
export interface IGoProps extends HTMLAttributes<HTMLElement> {

  /**
   * Route name / url.
   */
  to: string;

  /**
   * PathParams.
   */
  params?: object;

  /**
   * QueryParams.
   */
  query?: object;

  /**
   * Set "active" className.
   */
  active?: string;

  /**
   * Active strict.
   */
  strict?: boolean;
}

export interface IGoState {
  active: boolean;
}

/**
 * Wrapper of Anchor element with some specs of Router.
 */
@attach
export class Go extends Component<IGoProps, IGoState> {

  @inject(Router)
  private router: Router;

  /**
   *
   */
  @action
  public onClick(e: any): Promise<any> {
    e.preventDefault();
    if (this.props.onClick) {
      this.props.onClick(e);
    }
    const {to, params, query} = this.props;
    return this.router.go({to, params, query});
  }

  /**
   *
   */
  @on(olyReactRouterEvents.TRANSITION_END)
  public onTransitionEnd() {
    const {to, params, query} = this.props;
    const active = this.router.isActive({to, params, query}, this.props.strict);
    if (this.state.active !== active) {
      this.setState({active});
    }
  }

  /**
   *
   */
  public componentWillMount() {
    const {to, params, query} = this.props;
    this.state = {
      active: this.router.isActive({to, params, query}, this.props.strict),
    };
  }

  /**
   *
   */
  public render(): JSX.Element {
    const {to, params, query, strict, active, ...rest} = this.props;
    return createElement("a" as any, {
      className: this.state.active ? "active" : undefined,
      ...rest,
      href: this.router.href({to, params, query}),
      onClick: this.onClick,
    }, this.props.children);
  }
}
