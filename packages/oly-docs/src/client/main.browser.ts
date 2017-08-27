import { Kernel } from "oly";
import { ReactBrowserProvider } from "oly-react";
import { MainPages } from "./layout/MainPages";

Kernel
  .create({
    DOCS_DATA: window["__DOCS__"],
    REACT_ROUTER_HASH: true,
    ...process.env,
  })
  .with(MainPages, ReactBrowserProvider)
  .start()
  .catch(console.error);
