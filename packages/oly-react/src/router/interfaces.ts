import { Class, IMetadata } from "oly-core";
import { PathRegExp } from "path-to-regexp";
import { ComponentClass } from "react";

/**
 * Layer object.
 */
export type IChunks = { [key: string]: JSX.Element }; // tslint:disable-line

/**
 * Result of page controller.
 */
export type IRawChunk = JSX.Element | ComponentClass<any> | IChunks;

export type ITransitionType = "PUSH" | "POP" | "REPLACE" | "NONE";

export interface ITransition {
  from?: IMatch;
  to: IMatch;
  type: ITransitionType;
}

export interface ITransitionError extends ITransition {
  error: Error;
}

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
  type?: ITransitionType;
  query?: object;
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
