import { FocusStyleManager } from "@blueprintjs/core";
import { Kernel } from "oly";
import { ReactBrowserProvider } from "oly-react";
import { Application } from "./Application";

FocusStyleManager.onlyShowFocusOnTabs();

Kernel
  .create({
    DOCS: window["__DOCS__"],
    REACT_ROUTER_HASH: true,
    ...process.env,
  })
  .with(Application, ReactBrowserProvider)
  .start()
  .catch(console.error);
