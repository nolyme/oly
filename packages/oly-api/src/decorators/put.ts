import { route } from "oly-router";

/**
 * Create a PUT route.
 *
 * ```typescript
 * class A {
 *  @put("/") update() {}
 * }
 * ```
 *
 * @param path    Relative path
 */
export const put = (path: string) => route({method: "PUT", path});
