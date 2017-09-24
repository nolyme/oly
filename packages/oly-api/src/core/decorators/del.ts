import { route } from "./route";

/**
 * Create a DEL route.
 *
 * ```ts
 * class Ctrl {
 *
 *   @del("/")
 *   remove() {
 *     return {ok: true};
 *   }
 * }
 *
 * Kernel.create().with(Ctrl, ApiProvider).start();
 * ```
 *
 * @param path    Relative path
 */
export const del = (path: string) => route({method: "DEL", path});
