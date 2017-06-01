import { IMetadata } from "oly-core";

/**
 *
 */
export type IMethods = "GET" | "POST" | "DEL" | "PUT" | "PATCH";

/**
 *
 */
export interface IRouterTarget {
  prefix: string;
}

/**
 *
 */
export interface IRouterProperty {
  method: IMethods;
  path: string;
  middlewares: any[];
  api: any;
}

/**
 *
 */
export interface IRouterMetadata extends IMetadata {
  target: IRouterTarget;
  properties: {
    [key: string]: IRouterProperty;
  };
}
