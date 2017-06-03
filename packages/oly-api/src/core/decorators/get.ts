import { route } from "../../router/decorators/route";

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
export const get = (path: string) => route({method: "GET", path});
