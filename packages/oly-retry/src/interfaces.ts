import { Class } from "oly";

export interface IRetryOptions {

  when: Array<Class<Error> | RegExp>;

  attempts: number;
}
