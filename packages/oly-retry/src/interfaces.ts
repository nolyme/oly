import { Class } from "oly-core";

export interface IRetryOptions {
  when: Array<Class<Error> | RegExp>;
  attempts: number;
}
