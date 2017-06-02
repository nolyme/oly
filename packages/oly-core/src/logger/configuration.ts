import { _ } from "../kernel/Global";
import { Kernel } from "../kernel/Kernel";
import { JsonLogger } from "./JsonLogger";

/**
 * Use JsonLogger if production mode is enabled.
 *
 * @param kernel
 */
export const USE_JSON_LOGGER_ON_PRODUCTION = (kernel: Kernel) => {
  if (_.isProduction()) {
    kernel.with(JsonLogger);
  }
};
