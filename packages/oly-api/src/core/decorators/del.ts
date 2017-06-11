import { route } from "../../router/decorators/route";

/**
 * Create a DEL route.
 *
 * ```ts
 * class A {
 *  @del("/") remove() {}
 * }
 * ```
 *
 * @param path    Relative path
 */
export const del = (path: string) => route({method: "DEL", path});
