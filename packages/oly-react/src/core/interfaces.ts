import { Function } from "oly-core";
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
export interface IActionResultError {
  component: Function;
  action: string;
  error: Error;
}

/**
 *
 */
export interface IActionResult<T> {
  component: Function;
  action: string;
  data: T;
}

/**
 *
 */
export interface IActionMetadata {
  name: string;
}

/**
 *
 */
export interface IActionMetadataMap {
  [key: string]: IActionMetadata;
}
