import { Kernel, lyDefinition, lyDependencies, lyStates, MetadataUtil } from "oly-core";
import * as React from "react";
import { attach } from "./decorators/attach";

/**
 * DO NOT USE THIS
 *
 * @param kernel
 * @experimental
 */
export const USE_AUTO_ATTACH = (kernel: Kernel) => {

  const $React = React as any;
  const $createElement = $React.createElement;

  $React.createElement = function createElement(this: any) {
    if (
      typeof arguments[0] === "function"
      && ( MetadataUtil.has(lyDefinition, arguments[0])
        || MetadataUtil.has(lyDependencies, arguments[0])
        || MetadataUtil.has(lyStates, arguments[0]))
    ) {
      // poop on everything
      arguments[0] = attach(arguments[0]);
    }
    return $createElement.apply(this, arguments);
  };
};
