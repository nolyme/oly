import { route } from "./route";

/**
 * Create a POST route.
 *
 * ```ts
 * class Ctrl {
 *
 *   @post("/")
 *   create() {
 *     return {ok: true};
 *   }
 * }
 *
 * Kernel.create().with(Ctrl, ApiProvider).start();
 * ```
 *
 * @param path    Relative path
 */
export const post = (path: string) => route({method: "POST", path});
