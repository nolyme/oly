import { use } from "oly-api";
import { Meta } from "oly-core";
import { olyRouterKeys } from "oly-router";
import { hasRole } from "../middlewares/hasRole";

/**
 *
 * @param roles
 */
export const auth = (...roles: string[]) => (target: object, propertyKey: string) => {
  use(hasRole(...roles))(target, propertyKey);
  Meta.of({key: olyRouterKeys.router, target, propertyKey}).set({
    roles,
  });
};
