import { IDecorator, Kernel, Meta, olyCoreKeys } from "oly-core";
import { IKoaContext } from "oly-http";
import { use } from "oly-router";

export const multer: any = require("koa-multer"); // tslint:disable-line

export interface IUploadOptions {
  limit?: number;
  file?: string;
  required?: boolean;
}

export class UploadDecorator implements IDecorator {

  private options: IUploadOptions;

  public constructor(options: IUploadOptions | string = {}) {
    if (typeof options === "string") {
      this.options = {file: options};
    } else {
      this.options = options;
    }
  }

  public asParameter(target: object, propertyKey: string, index: number): void {
    const limit = this.options.limit || 2000000;
    const file = this.options.file || "file";

    use(multer({storage: multer.memoryStorage(), limit: {fileSize: limit}}).single(file))(target, propertyKey);
    Meta.of({key: olyCoreKeys.arguments, target, propertyKey, index}).set({
      type: Meta.designParamTypes(target, propertyKey)[index] as any,
      handler: (k: Kernel) => {
        const ctx: IKoaContext = k.state("Koa.context");
        if (ctx) {
          return ctx.req[file];
        }
      },
    });
  }
}

/**
 * TODO: rename to @file("...") files: IFileUpload | IFileUpload[]
 * Don't import multer here!!!
 */
export const upload = Meta.decorator<IUploadOptions>(UploadDecorator);
