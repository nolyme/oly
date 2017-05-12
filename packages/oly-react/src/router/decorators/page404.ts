import { page } from "./page";

/**
 * Page used when not found.
 */
export const page404 = (t: object, p: string) => page("**")(t, p);