import { arg } from "./arg";
import { use } from "./use";

export const multer: any = require("koa-multer"); // tslint:disable-line

/**
 * Do not use this.
 * This is too specific, you should use your own multer configuration.
 *
 * ```
 * class A {
 *  @post("/") upload(@upload() file: any) {}
 * }
 * ```
 *
 * @experimental
 */
export const upload = (file: string = "file", limit: number = 2000000) => {
  return (target: object, propertyKey: string, parameterIndex: number) => {

    use(multer({storage: multer.memoryStorage(), limit: {fileSize: limit}}).single(file))(target, propertyKey);

    return arg({upload: file})(target, propertyKey, parameterIndex);
  };
};
