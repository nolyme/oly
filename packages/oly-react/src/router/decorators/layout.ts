import { page } from "./page";

/**
 * Page will be used as layout (parent)
 */
export const layout = (t: object, p: string) => page(":layout:")(t, p);
