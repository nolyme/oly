import { IDecorator, Kernel, Meta, olyCoreKeys } from "oly-core";
import { IKoaContext } from "oly-http";
import { olyRouterKeys } from "oly-router";
import { olyApiErrors } from "../constants/errors";
import { BadRequestException } from "../exceptions/BadRequestException";

export interface IFileOptions {
  limit?: number;
  file?: string;
  required?: boolean;
}

export class FileDecorator implements IDecorator {

  private options: IFileOptions;

  public constructor(options: IFileOptions | string = {}) {
    if (typeof options === "string") {
      this.options = {file: options};
    } else {
      this.options = options;
    }
  }

  public asParameter(target: object, propertyKey: string, index: number): void {
    const file = this.options.file || Meta.getParamNames(target[propertyKey])[index];
    Meta.of({key: olyRouterKeys.router, target, propertyKey, index}).set({
      kind: "file",
      name: file,
      type: Object,
    });
    Meta.of({key: olyCoreKeys.arguments, target, propertyKey, index}).set({
      type: Meta.designParamTypes(target, propertyKey)[index] as any,
      handler: (k: Kernel) => {
        const ctx: IKoaContext = k.state("Koa.context");
        if (ctx) {
          const blob = ctx.req[file];
          if (this.options.required !== false && !blob) {
            throw new BadRequestException(olyApiErrors.missing("file", file));
          }
          return blob;
        }
      },
    });
  }
}

/**
 *
 */
export const file = Meta.decorator<IFileOptions | string>(FileDecorator);
