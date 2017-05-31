import { Kernel } from "../src/kernel/Kernel";
import { _ } from "../src/kernel/utils/CommonUtil";

export const createKernel = (options: object = {}) => {
  return Kernel.create(Object.assign({}, {OLY_LOGGER_LEVEL: "ERROR"}, options, process.env));
};

declare global {
  namespace jest {
    interface Matchers { // tslint:disable-line
      rejects: Matchers;
    }
  }
}
