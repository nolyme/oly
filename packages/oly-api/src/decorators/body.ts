import { Class, IDecorator, Kernel, Meta, olyCoreKeys } from "oly-core";
import { IKoaContext } from "oly-http";
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
    Meta.of({key: olyCoreKeys.arguments, target, propertyKey, index}).set({
      type: Meta.designParamTypes(target, propertyKey)[index] as any,
      handler: (k: Kernel) => {
        const ctx: IKoaContext = k.state("Koa.context");
        if (ctx) {
          const type = this.options.type || Meta.designParamTypes(target, propertyKey)[index];
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
