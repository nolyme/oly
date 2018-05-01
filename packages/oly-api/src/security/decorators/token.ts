import { IDecorator, Kernel, Meta, olyCoreKeys } from "oly";
import { use } from "../../core/decorators/use";
import { isAuth } from "../middlewares/isAuth";
import { Auth } from "../services/Auth";

export class TokenDecorator implements IDecorator {

  public asParameter(target: object, propertyKey: string, index: number): void {

    use(isAuth())(target, propertyKey);

    Meta.of({key: olyCoreKeys.arguments, target, propertyKey, index}).set({
      handler: (k: Kernel) => {
        return k.get(Auth).token;
      },
    });
  }
}

/**
 * ```ts
 * class Api {
 *
 *   @get("/")
 *   something(@token tk: IToken) {
 *   }
 * }
 * ```
 */
export const token = Meta.decoratorWithOptions(TokenDecorator);
