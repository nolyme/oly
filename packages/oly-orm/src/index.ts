export * from "./decorators";
export * from "./providers/DatabaseProvider";
export * from "./providers/Repository";

import * as _orm from "typeorm";

export const orm = _orm;
