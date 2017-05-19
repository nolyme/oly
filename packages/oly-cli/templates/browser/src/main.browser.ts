import { Kernel, Logger } from "oly-core";

new Kernel()
  .configure((k) => {
    k.get(Logger).as("Demo").info("Hello");
  })
  .start()
  .catch(console.error);
