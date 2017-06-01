import { FocusStyleManager } from "@blueprintjs/core";
import { Kernel } from "oly-core";
import { ReactBrowserProvider } from "oly-react";
import { App } from "./App";
import { AppModule } from "./module/AppModule";

FocusStyleManager.onlyShowFocusOnTabs();

new Kernel({
  DOCS: window["DOCS"], // tslint:disable-line
  OLY_REACT_ROUTER_HASH: true,
  OLY_LOGGER_LEVEL: "TRACE",
})
  .configure((k) => window["k"] = k) // tslint:disable-line
  .with(
    App,
    AppModule,
    ReactBrowserProvider,
  )
  .start()
  .catch(console.error);
