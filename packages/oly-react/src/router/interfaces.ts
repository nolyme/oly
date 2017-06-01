import { StateObject } from "@uirouter/core";
import { Class, IMetadata } from "oly-core";
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
 * Page metadata.
 */
export interface IPagesProperty {
  abstract: boolean;
  url: string;
  name: string;
  children?: Class[];
}

export interface IPagesMetadata extends IMetadata {
  properties: {
    [key: string]: IPagesProperty;
  };
}
