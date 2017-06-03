import { _, Kernel } from "oly-core";
import { SwaggerProvider } from "./providers/SwaggerProvider";

export const USE_SWAGGER_ON_DEVELOPMENT = (kernel: Kernel) => {
  if (!_.isProduction()) {
    kernel.with(SwaggerProvider);
  }
};
