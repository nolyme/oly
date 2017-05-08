export * from "./DocProvider";
export * from "./DocParser";
export * from "./interfaces";

import { Kernel } from "oly-core";
import { DocProvider } from "./DocProvider";

export const main = (args: any) => {
  return new Kernel(args)
    .with(DocProvider)
    .start()
    .catch(console.error);
};
