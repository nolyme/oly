import { Class, IMetadata } from "oly-core";

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
  middlewares: Function[];
  api: any;
  roles: string[];
}

/**
 *
 */
export interface IRouterArgument {
  kind: "param" | "query" | "header" | "body";
  type: Class;
  name: string;
}

/**
 *
 */
export interface IRouterMetadata extends IMetadata {
  target: IRouterTarget;
  properties: {
    [key: string]: IRouterProperty;
  };
  args: {
    [key: string]: IRouterArgument[];
  };
}
