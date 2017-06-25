import { Class, IDecorator, Kernel, Meta, olyCoreKeys } from "oly-core";
import { IKoaContext } from "oly-http";
import { olyApiErrors } from "../constants/errors";
import { BadRequestException } from "../exceptions/BadRequestException";
import { KoaRouterBuilder } from "../services/KoaRouterBuilder";

export interface IHeaderOptions {
  name?: string;
  type?: any;
  required?: boolean;
}

export class HeaderDecorator implements IDecorator {

  private options: IHeaderOptions;

  public constructor(options: IHeaderOptions | string = {}) {
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
          const builder = k.inject(KoaRouterBuilder);
          const type = this.options.type || Meta.designParamTypes(target, propertyKey)[index];
          const name = this.options.name || Meta.getParamNames(target[propertyKey])[index];
          const value: string = ctx.header[name.toLowerCase()]; // TODO: Check if we need toLowerCase()

          if (!value && this.options.required === true) {
            throw new BadRequestException(olyApiErrors.missing("header", name));
          }

          return builder.parseAndCast(
            value,
            type,
            name,
            "header");
        }
      },
    });
  }
}

/**
 *
 */
export const header = Meta.decorator<IHeaderOptions>(HeaderDecorator);
