import { Kernel } from "../kernel/Kernel";
import { JsonLogger } from "./JsonLogger";
import { MutedLogger } from "./MutedLogger";
import { _ } from "../kernel/utils/CommonUtil";

/**
 * Hide Logger if production mode is enabled.
 *
 * @param kernel
 */
export const USE_MUTED_LOGGER_ON_PRODUCTION = (kernel: Kernel) => {
  if (_.isProduction()) {
    kernel.with(MutedLogger);
  }
};

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
