import { route } from "../../router/decorators/route";

/**
 * Create a PUT route.
 *
 * ```ts
 * class A {
 *  @put("/") update() {}
 * }
 * ```
 *
 * @param path    Relative path
 */
export const put = (path: string) => route({method: "PUT", path});
