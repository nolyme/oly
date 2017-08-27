import { Helmet as _Helmet } from "react-helmet";
import { autoAttach } from "./core/configuration";

autoAttach();

export * from "./core/constants/events";
export * from "./core/constants/keys";
export * from "./core/interfaces";
export * from "./core/decorators/attach";
export * from "./core/decorators/action";
export * from "./core/components/AppContext";
export * from "./core/services/ComponentInjector";

export * from "./router/interfaces";
export * from "./router/components/Layer";
export * from "./router/components/Go";
export * from "./router/components/Active";
export * from "./router/components/View";
export * from "./router/constants/keys";
export * from "./router/constants/errors";
export * from "./router/constants/events";
export * from "./router/decorators/page";
export * from "./router/decorators/layout";
export * from "./router/decorators/param";
export * from "./router/decorators/query";
export * from "./router/services/Router";
export * from "./router/services/Browser";
export * from "./router/providers/ReactRouterProvider";
export * from "./router/providers/ReactBrowserProvider";

export * from "./pixie/services/Pixie";
export * from "./pixie/services/PixieHttp";

export const Helmet = _Helmet;
