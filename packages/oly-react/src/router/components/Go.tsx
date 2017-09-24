import { inject } from "oly";
import * as React from "react";
import { Component, createElement, HTMLAttributes, MouseEvent } from "react";
import { autoAttach } from "../../core/configuration";
import { action } from "../../core/decorators/action";
import { Router } from "../services/Router";

autoAttach();

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
 * Go has a className "is-active" if Router#isActive() is `true`. See Router#isActive().
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

    const isModifiedEvent = (event: MouseEvent<HTMLAnchorElement>) =>
      (event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);

    if (
      !e.defaultPrevented && // onClick prevented default
      e.button === 0 && // ignore right clicks
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
      ...rest,
      className: (this.props.className || "") + " " + ((this.isActive) ? (this.props.active || "is-active") : ""),
      href: this.router.href({to, params, query}),
      onClick: this.onClick,
    }, this.props.children);
  }
}
