/**
 * Configuration.
 */
declare module "oly-core/lib/env" {
  interface IEnv {
    /**
     *
     */
    OLY_DATABASE_URL?: string;
    /**
     *
     */
    OLY_DATABASE_AUTO_SYNC?: boolean;
    /**
     *
     */
    OLY_DATABASE_SHOW_LOGS?: boolean;
  }
}

import * as TypeORM from "typeorm";

export const orm = TypeORM;

export * from "./decorators";
export * from "./providers/DatabaseProvider";
export * from "./providers/Repository";
