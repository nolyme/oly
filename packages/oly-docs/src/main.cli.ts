import { Kernel } from "oly-core";
import { DocProvider } from "./cli/DocProvider";

new Kernel({
  ...process.env,
  OLY_LOGGER_LEVEL: process.argv.indexOf("--verbose") > -1 ? "TRACE" : "INFO",
  OLY_APP_NAME: "Docs",
})
  .with(DocProvider)
  .start()
  .catch(console.error);
