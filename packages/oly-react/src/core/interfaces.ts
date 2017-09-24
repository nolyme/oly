import { IMetadata } from "oly";
import { ComponentClass, StatelessComponent } from "react";

/**
 * Union of each type of React Component
 */
export type RouteComponent =
  StatelessComponent<any> |
  ComponentClass<any>;

/**
 *
 */
export interface IActiveBeginEvent {
  name: string;
}

/**
 *
 */
export interface IActionErrorEvent {
  component: Function;
  action: string;
  error: Error;
}

/**
 *
 */
export interface IActionSuccessEvent<T> {
  component: Function;
  action: string;
  data: T;
}

/**
 *
 */
export interface IActionsProperty {
  name: string;
  prevent: boolean;
  after?: object | Function;
  before?: object | Function;
  loading?: boolean | string;
}

/**
 *
 */
export interface IActionsMetadata extends IMetadata {
  properties: {
    [key: string]: IActionsProperty;
  };
}
