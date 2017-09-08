export * from "./providers/DatabaseProvider";
export * from "./services/Repository";
export * from "./decorators";

import * as _orm from "typeorm";

export const orm = _orm;
