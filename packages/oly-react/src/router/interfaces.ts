import { StateObject } from "@uirouter/core";
import { Function } from "oly-core";
import { ComponentClass } from "react";

/**
 * Layer object.
 */
export type IChunks = { [key: string]: JSX.Element }; // tslint:disable-line

/**
 * Result of page controller.
 */
export type IRawChunk = JSX.Element | ComponentClass<any> | IChunks;

/**
 *
 */
export type IRouteState = StateObject;

/**
 * Layer description.
 */
export interface ILayer {
  chunks: IChunks;
}

/**
 * Page options.
 */
export interface IPageOptions {
  children?: Function[];
  data?: any;
  name?: string;
  abstract?: boolean;
}

/**
 * Page metadata.
 */
export interface IPageMetadata {
  abstract: boolean;
  url: string;
  name: string;
  target: Function;
  propertyKey: string;
  children?: Function[];
  args: Array<{
    type: "path" | "query";
    name: string;
  }>;
}

/**
 * Page metadata map.
 */
export interface IPageMetadataMap {
  [propertyKey: string]: IPageMetadata;
}
