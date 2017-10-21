import { inject } from "oly";
import * as React from "react";
import { Component, createElement, HTMLAttributes, MouseEvent } from "react";
import { action } from "../../core/decorators/action";
import { Router } from "../services/Router";

export const isModifiedEvent = (event: MouseEvent<HTMLAnchorElement>) =>
  (event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);

/**
 *
 */
export interface IGoProps extends HTMLAttributes<HTMLAnchorElement> {

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
}

/**
 * Anchor element + Router#go().
 *
 * ```ts
 * <Go to="/">Home</Go>
 * <Go to="users.detail" params={{userId: "1"}}>...</Go>
 * ```
 *
 * ### IsActive
 *
 * ```ts
 * <Go to="/" active="my-active-class" strict={true}>...</Go>
 * ```
 *
 * ### Action
 *
 * - Go#onClick is ALWAYS an @action.
 */
export class Go extends Component<IGoProps, IGoState> {

  @inject
  private router: Router;

  private watchlist: string[];

  public get isActive() {
    return this.router.isActive(this.props, this.props.strict);
  }

  /**
   *
   */
  @action
  public async onClick(e: any): Promise<any> {

    if (this.props.onClick) {
      this.props.onClick(e);
    }

    if (
      !e.defaultPrevented && // onClick prevented default
      (e.button === 0 || e.button === undefined) && // ignore right clicks
      !this.props["target"] && // let browser handle "target=_blank" etc.
      !isModifiedEvent(e) // ignore clicks with modifier keys
    ) {
      e.preventDefault();

      const {to, params, query} = this.props;

      return this.router.go({to, params, query});
    }
  }

  /**
   *
   */
  public componentWillMount() {
    const {to, params, query} = this.props;
    if (this.props.active) {
      this.setState({
        active: this.router.isActive({to, params, query}, this.props.strict),
      });
    } else {
      this.watchlist = [];
    }
  }

  /**
   *
   */
  public render(): JSX.Element {
    const {to, params, query, active, strict, ...others} = this.props;
    const activeClassName = typeof active === "string" ? ` ${active}` : "";
    return createElement("a" as any, {
      ...others,
      className: ((this.props.className || "") + (this.isActive ? activeClassName : "")) || undefined,
      href: this.router.href({to, params, query}),
      onClick: this.onClick,
    }, this.props.children);
  }
}
