/**
 *
 */
declare module "oly-core/lib/env" {
  interface IEnv {
    /**
     * Set the mongodb connection url.
     */
    OLY_MONGO_URL?: string;
  }
}

export * from "./Document";
export * from "./interfaces";
export * from "./Repository";
export * from "./annotations";
export * from "./MongoProvider";
