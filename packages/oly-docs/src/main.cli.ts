import { Kernel } from "oly-core";
import { DocProvider } from "./cli/DocProvider";

new Kernel({
  ...process.env,
  OLY_APP_NAME: "Docs",
})
  .with(DocProvider)
  .start()
  .catch(console.error);
