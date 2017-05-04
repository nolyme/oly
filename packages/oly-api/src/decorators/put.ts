import { route } from "./route";

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
export const put = (path: string) => route("PUT", path);
