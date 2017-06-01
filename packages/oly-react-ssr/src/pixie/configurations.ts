import { Function, Kernel, MetadataUtil } from "oly-core";
import { Pixie } from "./services/Pixie";
import { PixieHttp } from "./services/PixieHttp";

/**
 * DO NOT USE THIS
 *
 * @param use
 * @param provide
 * @experimental
 */
export const USE_TUNNEL = (use: Function, provide: Function) => (kernel: Kernel) => {
  const pixie = kernel.get(Pixie);
  const http = kernel.get(PixieHttp);
  const ctrl = kernel.get(use, {register: false});
  const router = MetadataUtil.get("ly:router", use);
  for (const key of Object.keys(router.routes)) {
    const route = router.routes[key];
    ctrl[key + "$$"] = ctrl[key];
    ctrl[key] = function __() {
      const args = arguments;
      return pixie.fly(http.createCacheKey(route.method, router.prefix + route.path),
        () => ctrl[key + "$$"].apply(ctrl, [args]));
    };
    kernel.with({provide, use: () => ctrl});
  }
};
