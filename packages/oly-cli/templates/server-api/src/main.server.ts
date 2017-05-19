import { ApiProvider } from "oly-api";
import { Kernel } from "oly-core";
import { RootController } from "./controllers/RootController";

new Kernel()
  .with(
    ApiProvider,
    RootController,
  )
  .start()
  .catch(console.error);
