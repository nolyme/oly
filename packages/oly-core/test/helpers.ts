import { Kernel } from "../src/Kernel";
import { _ } from "../src/utils/CommonUtil";

export const createKernel = (options: object = {}) => {
  return Kernel.create(_.assign({}, {OLY_LOGGER_LEVEL: "ERROR"}, options, process.env));
};

declare global {
  namespace jest {
    interface Matchers { // tslint:disable-line
      rejects: Matchers;
    }
  }
}
