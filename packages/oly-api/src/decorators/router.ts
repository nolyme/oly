import { router as $router } from "oly-router";

/**
 * Example of router decorator.
 *
 * ```typescript
 *  @router("/")
 * class A {}
 * ```
 *
 * @decorator         Class
 * @param prefix      Define a prefix before each route of the router
 */
export const router = $router;
