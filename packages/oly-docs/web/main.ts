import { Kernel, USE_NODE_ENV } from "oly-core";
import { Browser, ReactBrowserProvider } from "oly-react";
import { HashBrowser } from "oly-react/lib/router/services/HashBrowser";
import { App } from "./App";
import { AppModule } from "./module/AppModule";

new Kernel({
  DOC: process.env.DOC,
  OLY_LOGGER_LEVEL: "TRACE",
})
  .configure(USE_NODE_ENV)
  .configure((k) => window["k"] = k)
  .with({
    provide: Browser,
    use: HashBrowser,
  })
  .with(
    App,
    AppModule,
    ReactBrowserProvider,
  )
  .start()
  .catch(console.error);
