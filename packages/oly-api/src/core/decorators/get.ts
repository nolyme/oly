import { route } from "./route";

/**
 * Create a GET route.
 *
 * ```ts
 * class Ctrl {
 *
 *   @get("/")
 *   find() {
 *     return {ok: true};
 *   }
 * }
 *
 * Kernel.create().with(Ctrl, ApiProvider).start();
 * ```
 *
 * @param path    Relative path
 */
export const get = (path: string) => route({method: "GET", path});
