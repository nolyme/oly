import { Kernel } from "oly-core";
import { DocProvider } from "./providers/DocProvider";

new Kernel({
  ...process.env,
  LOGGER_LEVEL: process.argv.indexOf("--verbose") > -1 ? "TRACE" : "INFO",
  APP_NAME: "Docs",
})
  .with(DocProvider)
  .start()
  .catch(console.error);