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
   *
   */
  to: string;

  /**
   *
   */
  params?: object;
}

export interface IGoState {
  active: boolean;
}

/**
 *
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
    return this.router.go({
      to: this.props.to,
      params: this.props.params,
    });
  }

  /**
   *
   */
  @on(olyReactRouterEvents.TRANSITION_END)
  public onTransitionEnd() {
    const active = this.router.isActive(this.props.to);
    if (this.state.active !== active) {
      this.setState({active});
    }
  }

  /**
   *
   */
  public componentWillMount() {
    this.state = {
      active: this.router.isActive(this.props.to),
    };
  }

  /**
   *
   */
  public render(): JSX.Element {
    const {to, params, ...rest} = this.props;
    return createElement("a" as any, {
      className: this.state.active ? "active" : undefined,
      ...rest,
      href: this.router.href({to, params}),
      onClick: this.onClick,
    }, this.props.children);
  }
}
