import { Kernel } from "oly-core";
import { DocProvider } from "./DocProvider";

new Kernel({
  ...process.env,
  OLY_APP_NAME: "OlyDocs",
})
  .with(DocProvider)
  .start()
  .catch(console.error);
