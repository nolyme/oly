import { Kernel } from "oly-core";
import { ReactBrowserProvider } from "oly-react";
import { Application } from "./Application";

new Kernel()
  .with(
    ReactBrowserProvider,
    Application,
  )
  .start()
  .catch(console.error);
