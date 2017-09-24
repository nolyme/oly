import { IDecorator, Meta } from "oly";
import { olyApiKeys } from "../constants/keys";

export type IUseOptions = Function;

export class UseDecorator implements IDecorator {

  private options: Function;

  public constructor(options: Function) {
    this.options = options;
  }

  public asClass(target: Function): void {
    Meta.of({key: olyApiKeys.router, target}).set({
      middlewares: [this.options],
    });
  }

  public asMethod(target: object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>): void {
    Meta.of({key: olyApiKeys.router, target, propertyKey}).set({
      middlewares: [this.options],
    });
  }

  public asProperty(target: object, propertyKey: string): void {
    this.asMethod(target, propertyKey, {});
  }
}

/**
 * Use a middleware.
 *
 * ```ts
 * &shy;@use(aMiddlewareForAllRoutes)
 * &shy;@router("/")
 * class Ctrl {
 *
 *   @use(aMiddlewareForThisRoute)
 *   @get("/")
 *   findUsers(ctx: IKoaContext) {
 *     return [];
 *   }
 * }
 * ```
 */
export const use = Meta.decoratorWithOptions<IUseOptions>(UseDecorator);
