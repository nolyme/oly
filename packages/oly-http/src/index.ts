// override default interface
declare module "http" {
  // tslint:disable-next-line
  interface Server {
    shutdown: Function;
  }
}

export * from "./index.browser";
export * from "./interfaces";
export * from "./middlewares";
export * from "./providers/HttpServerProvider";
export * from "./configuration";
