import { IDecorator, Meta } from "oly";
import { olyApiKeys } from "../../core/constants/keys";
import { IRouterPropertyApi } from "../interfaces";

export type IApiOptions = Partial<IRouterPropertyApi>;

export class ApiDecorator implements IDecorator {

  public constructor(private options: IApiOptions = {}) {
  }

  public asMethod(target: object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>): void {
    Meta.of({key: olyApiKeys.router, target, propertyKey}).set({
      api: this.options,
    });
  }

  public asProperty(target: object, propertyKey: string): void {
    this.asMethod(target, propertyKey, {});
  }
}

/**
 * Enhance swagger doc.
 */
export const api = Meta.decoratorWithOptions<IApiOptions>(ApiDecorator);
