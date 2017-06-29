import { IDecorator, Kernel, Meta, olyCoreKeys, TypeParser } from "oly-core";
import { IKoaContext } from "oly-http";
import { olyRouterKeys } from "oly-router";
import { olyApiErrors } from "../constants/errors";
import { BadRequestException } from "../exceptions/BadRequestException";

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
    const name = this.options.name || Meta.getParamNames(target[propertyKey])[index];
    const type = this.options.type || Meta.designParamTypes(target, propertyKey)[index];
    Meta.of({key: olyRouterKeys.router, target, propertyKey, index}).set({
      kind: "header",
      name,
      type,
    });
    Meta.of({key: olyCoreKeys.arguments, target, propertyKey, index}).set({
      type: Meta.designParamTypes(target, propertyKey)[index] as any,
      handler: (k: Kernel) => {
        const ctx: IKoaContext = k.state("Koa.context");
        if (ctx) {
          const value: string = ctx.header[name.toLowerCase()]; // TODO: Check if we need toLowerCase()

          const result = TypeParser.parse(type, value);

          if (result == null && this.options.required === true) {
            throw new BadRequestException(olyApiErrors.missing("header", name));
          }

          return result;
        }
      },
    });
  }
}

/**
 *
 */
export const header = Meta.decorator<IHeaderOptions>(HeaderDecorator);
