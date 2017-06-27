import { Class, IDecorator, Kernel, Meta, olyCoreKeys } from "oly-core";
import { IKoaContext } from "oly-http";
import { olyRouterKeys } from "oly-router";
import { olyApiErrors } from "../constants/errors";
import { BadRequestException } from "../exceptions/BadRequestException";

export interface IBodyOptions {
  type?: Class;
  name?: string;
  required?: boolean;
}

export class BodyDecorator implements IDecorator {

  private options: IBodyOptions;

  public constructor(options: IBodyOptions | Class = {}) {
    if (typeof options === "function") {
      this.options = {type: options};
    } else {
      this.options = options;
    }
  }

  public asParameter(target: object, propertyKey: string, index: number): void {
    const type = this.options.type || Meta.designParamTypes(target, propertyKey)[index];
    Meta.of({key: olyRouterKeys.router, target, propertyKey, index}).set({
      kind: "body",
      name: "body",
      type,
    });
    Meta.of({key: olyCoreKeys.arguments, target, propertyKey, index}).set({
      handler: (k: Kernel) => {
        const ctx: IKoaContext = k.state("Koa.context");
        if (ctx) {
          const value: object | object[] = this.options.name ? ctx.request.body[this.options.name] : ctx.request.body;

          if (!value && this.options.required === true) {
            throw new BadRequestException(olyApiErrors.missing("request", "body"));
          }

          return value;
        }
      },
    });
  }
}

/**
 * Extract `request.body` from IKoaContext.
 *
 * ```ts
 * class A
 *
 *   @post("/")
 *   create(@body body: object) {
 *     console.log(body);
 *   }
 * }
 * ```
 */
export const body = Meta.decorator<IBodyOptions>(BodyDecorator);
