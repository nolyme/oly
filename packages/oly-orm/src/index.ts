export * from "./providers/DatabaseProvider";
export * from "./services/Repository";

import * as _orm from "typeorm";

export const orm = _orm;
