import { ApiProvider } from "oly-api";
import { Kernel } from "oly-core";
import { RootApi } from "./api/RootApi";

new Kernel()
  .with(
    ApiProvider,
    RootApi,
  )
  .start()
  .catch(console.error);
