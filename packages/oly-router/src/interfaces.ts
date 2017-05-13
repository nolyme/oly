/**
 * HttpMethods.
 */
export type IMethods = "GET" | "POST" | "DEL" | "PUT" | "PATCH";

/**
 * Route metadata.
 */
export interface IRouteMetadata {
  method: IMethods;
  path: string;
  middlewares: any[];
  args: {
    [key: number]: {
      body?: any;
      query?: string;
      path?: string;
    },
  };
}

/**
 * Router metadata.
 */
export interface IRouterMetadata {
  prefix: string;
  routes: {
    [key: string]: IRouteMetadata;
  };
}
