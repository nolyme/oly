import { inject, on } from "oly-core";
import * as React from "react";
import { Children, Component } from "react";
import { IHrefQuery } from "../";
import { attach } from "../../core/decorators/attach";
import { olyReactRouterEvents } from "../constants/events";
import { Router } from "../services/Router";

/**
 *
 */
export interface IActiveProps {

  /**
   *
   */
  href: string | IHrefQuery;

  /**
   *
   */
  strict?: boolean;
}

export interface IActiveState {

  /**
   *
   */
  active: boolean;
}

/**
 *
 */
@attach
export class Active extends Component<IActiveProps, IActiveState> {

  @inject(Router)
  private router: Router;

  /**
   *
   */
  @on(olyReactRouterEvents.TRANSITION_END)
  public onTransitionEnd(): void {
    const active = this.router.isActive(this.props.href, this.props.strict);
    if (this.state.active !== active) {
      this.setState({active});
    }
  }

  /**
   *
   */
  public componentWillMount(): void {
    this.state = {
      active: this.router.isActive(this.props.href, this.props.strict),
    };
  }

  /**
   *
   */
  public render(): JSX.Element | null {
    if (!this.state.active || !this.props.children) {
      return null;
    }
    if (Array.isArray(this.props.children)) {
      return <div>{this.props.children}</div>;
    }
    return Children.only(this.props.children);
  }
}
