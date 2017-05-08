import { page } from "./page";

/**
 * Page used when error.
 */
export const page500 = (t: object, p: string) => page(":error:")(t, p);
