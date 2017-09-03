import { IDecorator, Kernel, Meta, olyCoreKeys, TypeParser } from "oly";
import { IKoaContext } from "oly-http";
import { build, olyMapperKeys } from "oly-json";
import { olyApiErrors } from "../constants/errors";
import { olyApiKeys } from "../constants/keys";
import { BadRequestException } from "../exceptions/BadRequestException";

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
    const name = this.options.name || Meta.getParamNames(target[propertyKey])[index];
    const type = this.options.type || Meta.designParamTypes(target, propertyKey)[index];
    Meta.of({key: olyApiKeys.router, target, propertyKey, index}).set({
      kind: "query",
      name,
      type,
    });
    Meta.of({key: olyCoreKeys.arguments, target, propertyKey, index}).set({
      handler: (k: Kernel) => {
        const ctx: IKoaContext = k.state("Koa.context");
        if (ctx) {
          const value: string = ctx.query[name] == null
            ? ctx.query[name + "[]"]
            : ctx.query[name];

          // /a?b -> b = true if Boolean
          if (value === "" && type === Boolean) {
            return true;
          }

          const result = TypeParser.parse(type, value);

          if (result == null && this.options.required === true) {
            throw new BadRequestException(olyApiErrors.missing("query", name));
          }

          return result;
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
 *
 */
export const query = Meta.decorator<IQueryOptions | string>(QueryDecorator);
