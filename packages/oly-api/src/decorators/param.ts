import { IDecorator, Kernel, Meta, olyCoreKeys } from "oly-core";
import { IKoaContext } from "oly-http";
import { olyApiErrors } from "../constants/errors";
import { BadRequestException } from "../exceptions/BadRequestException";
import { KoaRouterBuilder } from "../services/KoaRouterBuilder";

export interface IParamOptions {
  name?: string;
  type?: any;
  required?: boolean;
}

export class ParamDecorator implements IDecorator {

  private options: IParamOptions;

  public constructor(options: IParamOptions | string = {}) {
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
          const value: string = ctx.params[name];

          if (!value && this.options.required === true) {
            throw new BadRequestException(olyApiErrors.missing("param", name));
          }

          return builder.parseAndCast(
            value,
            type,
            name,
            "param");
        }
      },
    });
  }
}

/**
 *
 */
export const param = Meta.decorator<IParamOptions>(ParamDecorator);
