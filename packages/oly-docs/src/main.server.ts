import { Kernel } from "oly-core";
import { ReactServerProvider } from "oly-react";
import { Application } from "./web/Application";

require("./web/assets/docs");

declare const __DOCS__: any;

new Kernel({
  DOCS: __DOCS__,
  REACT_ROUTER_HASH: false,
  LOGGER_LEVEL: "TRACE",
  ...process.env,
})
  .with(Application, ReactServerProvider)
  .start()
  .catch(console.error);
