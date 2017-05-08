import { page } from "./page";

/**
 * Page will be used as layout (parent)
 */
export const pageLayout = (t: object, p: string) => page(":layout:")(t, p);
