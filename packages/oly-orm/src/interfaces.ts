import { Class } from "oly";

export interface IRepository<T = any> {

  readonly entityType: Class<T>;
}
