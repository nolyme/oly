import { inject } from "oly";
import * as React from "react";
import { Children, Component } from "react";
import { IHrefQuery } from "../interfaces";
import { Router } from "../services/Router";

/**
 *
 */
export interface IActiveProps {

  /**
   * Href / QueryHref.
   */
  href: string | IHrefQuery;

  /**
   * Compare exact path.
   */
  strict?: boolean;
}

export interface IActiveState {
}

/**
 *
 */
export class Active extends Component<IActiveProps, IActiveState> {

  @inject
  private router: Router;

  public get isActive() {
    return this.router.isActive(this.props.href, this.props.strict);
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
    if (!this.isActive || !this.props.children) {
      return null;
    }
    if (Array.isArray(this.props.children)) {
      return <div>{this.props.children}</div>;
    }
    return Children.only(this.props.children);
  }
}
