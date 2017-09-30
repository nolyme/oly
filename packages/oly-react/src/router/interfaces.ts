import { Class, IMetadata } from "oly";
import { PathRegExp } from "path-to-regexp";

/**
 * Layer object.
 */
export type IChunks = { [key: string]: JSX.Element }; // tslint:disable-line

export type ITransitionType = "PUSH" | "POP" | "REPLACE" | "NONE";

/**
 * @page index
 */

export interface ITransition {
  from?: IMatch;
  to: IMatch;
  type: ITransitionType;
}

/**
 * @page error
 */

export interface ITransitionError extends ITransition {
  error: Error;
}

/**
 * @on("oly:transition:begin")
 */

export interface ITransitionBeginEvent {
  transition: ITransition;
}

/**
 * @on("oly:transition:end")
 */

export interface ITransitionEndEvent {
  transition: ITransition | ITransitionError;
}

/**
 * @on("oly:transition:render")
 */

export interface ITransitionRenderEvent {
  transition: ITransition;
  level: number;
}

export interface INode {
  name: string;
  path: string;
  abstract?: boolean;
  parent?: string;
  target: Class;
  propertyKey: string;
}

export interface IRoute {
  abstract?: boolean;
  node: INode;
  name: string;
  stack: INode[];
  regexp?: PathRegExp;
  path: string;
}

export interface IHrefQuery {
  to: string;
  params?: object;
  query?: object;
  type?: ITransitionType;
}

export interface IMatch {
  path: string;
  route: IRoute;
  query: {
    [key: string]: string;
  };
  params: {
    [key: string]: string;
  };
}

/**
 * Layer description.
 */
export interface ILayer {
  node: INode;
  chunks: IChunks;
}

/**
 * Page metadata.
 */
export interface IPagesProperty {
  name: string;
  path: string;
  layout?: boolean;
  abstract?: boolean;
  children?: Class[];
}

/**
 *
 */
export interface IPagesMetadata extends IMetadata {
  properties: {
    [key: string]: IPagesProperty;
  };
}
