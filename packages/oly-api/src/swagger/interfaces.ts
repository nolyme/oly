/**
 *
 */
export interface IRouterPropertyApi {
  summary?: string;
  description?: string;
  security?: any[];
  responses?: any;
}

/**
 *
 */
export interface ISwaggerApi {
  parameters: any[];
  produces: string[];
  summary: string;
  tags: string[];
  description: string;
  security: any[];
  responses: {
    [status: string]: {
      description: string;
    };
  };
}

/**
 *
 */
export interface IPaths {
  [path: string]: {
    [method: string]: ISwaggerApi;
  };
}

/**
 *
 */
export interface ISwaggerSpec {
  swagger: string;
  basePath: string;
  definitions: any;
  host: string;
  info: {
    description: string;
    title: string;
    version: string;
  };
  schemes: string[];
  tags: Array<{ description: string; name: string }>;
  paths: IPaths;
  securityDefinitions: {
    Bearer: {
      in: string;
      name: string;
      type: string;
    };
  };
}
