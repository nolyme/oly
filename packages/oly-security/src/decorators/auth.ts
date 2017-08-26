import { Meta } from "oly";
import { olyApiKeys, use } from "oly-api";
import { hasRole } from "../middlewares/hasRole";

/**
 *
 * @param roles
 */
export const auth = (...roles: string[]) => (target: object, propertyKey: string) => {
  use(hasRole(...roles))(target, propertyKey);
  Meta.of({key: olyApiKeys.router, target, propertyKey}).set({
    roles,
  });
};
