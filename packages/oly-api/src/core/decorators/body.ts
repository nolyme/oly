import { Class, IDecorator, Kernel, Meta, olyCoreKeys, TypeParser } from "oly";
import { IKoaContext } from "oly-http";
import { build, olyMapperKeys } from "oly-json";
import { olyApiErrors } from "../constants/errors";
import { olyApiKeys } from "../constants/keys";
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

    Meta.of({key: olyApiKeys.router, target, propertyKey, index}).set({
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

          // !!!
          // body is already parsed by the middleware koa-bodyparser (see ApiProvider)
          // however, we MUST double check as we know here the "wanted type"

          // hack
          // {"Key": ""} - to -> "Key"
          if (type === Number || type === String || type === Boolean) {
            const keys = Object.keys(value);
            const data = (keys.length === 1 && value[keys[0]] === "") ? keys[0] : value;
            return TypeParser.parse(type, data);
          }

          return TypeParser.parse(type, value);
        }
      },
    });

    // auto @build with @body, remove this line if feature is useless
    if (Meta.of({key: olyMapperKeys.fields, target: type})) {
      build(target, propertyKey, index);
    }
  }
}

/**
 * Extract `request.body` from IKoaContext and convert value to the given type.
 *
 * ```ts
 * class Ctrl {
 *
 *   @post("/")
 *   create(@body data: object) {
 *     console.log(data);
 *   }
 * }
 *
 * Kernel.create().with(Ctrl, ApiProvider).start();
 * ```
 *
 * ### Json Validation
 *
 * ```ts
 * class Data {
 *   @field username: string;
 *   @field password: string;
 * }
 *
 * class Ctrl {
 *
 *   @post("/")
 *   create(@body data: Data) { // throw ValidationException if not valid.
 *     console.log(data);
 *   }
 * }
 * ```
 */
export const body = Meta.decorator<IBodyOptions | Class>(BodyDecorator);
