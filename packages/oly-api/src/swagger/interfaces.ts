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
  paths: {
    [path: string]: {
      [method: string]: {
        parameters: any[];
        produces: string[];
        summary: string;
        tags: string[]
        description: string;
        security: any[];
        responses: {
          [status: string]: {
            description: string;
          };
        }
      };
    };
  };
  securityDefinitions: {
    Bearer: {
      in: string;
      name: string;
      type: string;
    };
  };
}
