import { IDecorator, Kernel, Meta, olyCoreKeys } from "oly";
import { IKoaContext } from "oly-http";
import { olyApiErrors } from "../constants/errors";
import { olyApiKeys } from "../constants/keys";
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
    const fileName = this.options.file || Meta.getParamNames(target[propertyKey])[index];
    Meta.of({key: olyApiKeys.router, target, propertyKey, index}).set({
      kind: "file",
      name: fileName,
      type: Object,
    });
    Meta.of({key: olyCoreKeys.arguments, target, propertyKey, index}).set({
      type: Meta.designParamTypes(target, propertyKey)[index] as any,
      handler: (k: Kernel) => {
        const ctx: IKoaContext = k.state("Koa.context");
        if (ctx) {
          const blob = (ctx.req as any).files[fileName][0];
          if (this.options.required !== false && !blob) {
            throw new BadRequestException(olyApiErrors.missing("file", fileName));
          }
          return blob;
        }
      },
    });
  }
}

/**
 * Extract `ctx.req[file]` from KoaContext with [multer](https://github.com/koa-modules/multer) *(multipart/form-data)*.
 *
 * ```ts
 * import { IUploadedFile } from "oly-api";
 *
 * class Ctrl {
 *
 *   @post("/")
 *   something(@file("file") file: IUploadedFile) {
 *     file.buffer; // ...
 *   }
 * }
 *
 * Kernel.create().with(Ctrl, ApiProvider).start();
 * ```
 */
export const file = Meta.decorator<IFileOptions | string>(FileDecorator);
