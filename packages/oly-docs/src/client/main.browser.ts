import { Kernel } from "oly";
import { ReactBrowserProvider } from "oly-react";
import { SAVE_STATE } from "./configuration";
import { MainPages } from "./layout/MainPages";

Kernel
  .create({
    DOCS_DATA: window["__DOCS__"],
    REACT_ROUTER_HASH: true,
    ...process.env,
  })
  .configure(SAVE_STATE("SIDEBAR_IS_OPEN"))
  .with(MainPages, ReactBrowserProvider)
  .start()
  .catch(console.error);
