import { route } from "./route";

/**
 * Create a PUT route.
 *
 * ```ts
 * class Ctrl {
 *
 *   @put("/")
 *   update() {
 *     return {ok: true};
 *   }
 * }
 *
 * Kernel.create().with(Ctrl, ApiProvider).start();
 * ```
 *
 * @param path    Relative path
 */
export const put = (path: string) => route({method: "PUT", path});
