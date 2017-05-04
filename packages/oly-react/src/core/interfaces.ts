import { IClass } from "oly-core";
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
  component: IClass;
  action: string;
  error: Error;
}

/**
 *
 */
export interface IActionResult<T> {
  component: IClass;
  action: string;
  data: T;
}
