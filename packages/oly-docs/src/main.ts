import { Kernel } from "oly-core";
import { DocProvider } from "./DocProvider";

new Kernel(process.env)
  .with(DocProvider)
  .start()
  .catch(console.error);
