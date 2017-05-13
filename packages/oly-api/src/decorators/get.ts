import { route } from "oly-router";

/**
 * Create a GET route.
 *
 * ```typescript
 * class A {
 *  @get("/") find() {}
 * }
 * ```
 *
 * @param path    Relative path
 */
export const get = (path: string) => route("GET", path);
