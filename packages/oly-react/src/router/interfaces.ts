import { IAnyFunction, IClass, Kernel } from "oly-core";
import * as React from "react";
import { ChangeHook, LeaveHook, RouterState } from "react-router";

/**
 * @alias
 */
export type IRouterState = RouterState;

/**
 *
 */
export interface IPageArg {
  path?: string;
  query?: string;
}

/**
 *
 */
export interface IPageOptions {
  nested?: IClass[] | IClass;
  children?: IClass[];
  data?: any;
  onChange?: ChangeHook;
  onLeave?: LeaveHook;
}

/**
 *
 */
export interface IPage {
  options?: IPageOptions;
  url: string;
  args: IPageArg[];
}

/**
 *
 */
export interface IPages {
  [propertyKey: string]: IPage;
}

/**
 * Tree of page
 */
export interface IPageDefinition {
  pages: IPages;
  target: IClass;
  children: {
    [propertyKey: string]: IPageDefinition[];
  };
}

/**
 *
 */
export interface IRouteResolver {
  page?: IPage;
  stack?: number;
  error?: Error;
  component?: () => React.Component<any, any>;
  kernel: Kernel;
  parent?: IRouteResolver;
  path: string;
}

/**
 * Handler of @page, @pageLayout, @page404
 */
export type ActionHandler = (state: IRouterState, replace: IAnyFunction) => any;

/**
 * Handler of @page500
 */
export type ErrorHandler = (state: IRouterState, replace: IAnyFunction, error: Error) => any;
