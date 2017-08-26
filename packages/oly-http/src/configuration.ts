import { Kernel } from "oly";
import { compress, helmet } from "./middlewares";
import { HttpServerProvider } from "./providers/HttpServerProvider";

/**
 *
 * @param kernel
 */
export const USE_HTTP_COMPRESS = (kernel: Kernel) => {
  kernel.inject(HttpServerProvider).use(compress());
};

/**
 *
 * @param kernel
 */
export const USE_HTTP_HELMET = (kernel: Kernel) => {
  kernel.inject(HttpServerProvider).use(helmet());
};
