import { IDecorator, Kernel, Meta, olyCoreKeys } from "oly-core";
import { IKoaContext } from "oly-http";
import { olyApiErrors } from "../constants/errors";
import { BadRequestException } from "../exceptions/BadRequestException";
import { KoaRouterBuilder } from "../services/KoaRouterBuilder";

export interface IQueryOptions {
  name?: string;
  type?: any;
  required?: boolean;
}

export class QueryDecorator implements IDecorator {

  private options: IQueryOptions;

  public constructor(options: IQueryOptions | string = {}) {
    if (typeof options === "string") {
      this.options = {name: options};
    } else {
      this.options = options;
    }
  }

  public asParameter(target: object, propertyKey: string, index: number): void {
    Meta.of({key: olyCoreKeys.arguments, target, propertyKey, index}).set({
      type: Meta.designParamTypes(target, propertyKey)[index] as any,
      handler: (k: Kernel) => {
        const ctx: IKoaContext = k.state("Koa.context");
        if (ctx) {
          const builder = k.get(KoaRouterBuilder);
          const type = this.options.type || Meta.designParamTypes(target, propertyKey)[index];
          const name = this.options.name || Meta.getParamNames(target[propertyKey])[index];
          const value: string = ctx.query[name.toLowerCase()];

          if (!value && this.options.required === true) {
            throw new BadRequestException(olyApiErrors.missing("query", name));
          }

          return builder.parseAndCast(
            value,
            type,
            name,
            "query");
        }
      },
    });
  }
}

/**
 *
 */
export const query = Meta.decorator<IQueryOptions>(QueryDecorator);
