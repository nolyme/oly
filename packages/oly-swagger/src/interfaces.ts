/**
 * Enhance oly-api IRoute
 */
declare module "oly-api/lib/interfaces" {
  export interface IRoute {
    api: IRouteApi;
  }
}

/**
 *
 */
export interface IRouteApi {
  summary?: string;
  description?: string;
  security?: any[];
  responses?: any;
}
