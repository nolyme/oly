import { Class } from "oly-core";

export interface IRepository<T = any> {

  readonly entityType: Class<T>;
}
