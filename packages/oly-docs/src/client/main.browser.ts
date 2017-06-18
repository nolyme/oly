import { FocusStyleManager } from "@blueprintjs/core";
import { Kernel } from "oly-core";
import { ReactBrowserProvider } from "oly-react";
import { Application } from "./Application";

FocusStyleManager.onlyShowFocusOnTabs();

declare const __DOCS__: any;

new Kernel({
  DOCS: __DOCS__,
  REACT_ROUTER_HASH: true,
  LOGGER_LEVEL: "TRACE",
  ...process.env,
})
  .with(Application, ReactBrowserProvider)
  .start()
  .catch(console.error);
