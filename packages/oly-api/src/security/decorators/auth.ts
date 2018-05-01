import { IDecorator, Meta } from "oly";
import { olyApiKeys } from "../../core/constants/keys";
import { use } from "../../core/decorators/use";
import { hasRole } from "../middlewares/hasRole";

export class AuthDecorator implements IDecorator {

  public constructor(private roles: string | string[] = []) {
  }

  public asMethod(target: object, propertyKey: string, i: TypedPropertyDescriptor<any>) {

    const roles = typeof this.roles === "string" ? [this.roles] : this.roles;
    use(hasRole(...roles))(target, propertyKey);
    Meta.of({key: olyApiKeys.router, target, propertyKey}).set({
      roles,
    });
  }
}

/**
 * Sugar of @use + hasRole(...roles) middleware.
 *
 * ```ts
 *
 * class Api {
 *
 *   @auth           // check only auth
 *   @get("/")
 *   authOnly() {}
 *
 *   @auth("ADMIN")  // check data.roles[]
 *   @get("/admin")
 *   adminOnly() {}
 * }
 * ```
 */
export const auth = Meta.decorator<string | string[]>(AuthDecorator);
