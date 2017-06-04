import { FocusStyleManager } from "@blueprintjs/core";
import { Global, Kernel } from "oly-core";
import { ReactBrowserProvider } from "oly-react";
import { Application } from "./web/Application";
import "./web/main.scss";

FocusStyleManager.onlyShowFocusOnTabs();

new Kernel({
  DOCS: window["DOCS"],
  OLY_REACT_ROUTER_HASH: true,
  OLY_LOGGER_LEVEL: "TRACE",
})
  .configure((k) => Global.set("k", k))
  .with(Application, ReactBrowserProvider)
  .start()
  .catch(console.error);
