import { route } from "oly-router";

/**
 * Create a GET route.
 *
 * ```ts
 * class A {
 *  @get("/") find() {}
 * }
 * ```
 *
 * @param path    Relative path
 */
export const get = (path: string) => route({method: "GET", path});
