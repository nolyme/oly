import { route } from "oly-router";

/**
 * Create a POST route.
 *
 * ```typescript
 * class A {
 *  @post("/") create() {}
 * }
 * ```
 *
 * @param path    Relative path
 */
export const post = (path: string) => route("POST", path);
