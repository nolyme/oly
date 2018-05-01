import { inject } from "oly";
import * as React from "react";
import { Component, ReactNode } from "react";
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
  public render(): ReactNode {

    if (!this.isActive) {
      return null;
    }

    if (this.props.children == null) {
      return null;
    }

    return this.props.children;
  }
}
