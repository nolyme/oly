import { use } from "../../router/decorators/use";
import { hasRole } from "../middlewares/hasRole";

/**
 *
 * @param roles
 */
export const auth = (...roles: string[]) => (target: object, propertyKey: string) => {
  use(hasRole(...roles))(target, propertyKey);
};
