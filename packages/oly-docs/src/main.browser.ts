import { FocusStyleManager } from "@blueprintjs/core";
import { Global, Kernel } from "oly-core";
import { ReactBrowserProvider } from "oly-react";
import { Application } from "./web/Application";
import "./web/main.scss";

FocusStyleManager.onlyShowFocusOnTabs();

declare const __DOCS__: any;

new Kernel({
  DOCS: __DOCS__,
  OLY_REACT_ROUTER_HASH: true,
  OLY_LOGGER_LEVEL: "TRACE",
  ...process.env,
})
  .with(Application, ReactBrowserProvider)
  .start()
  .catch(console.error);
