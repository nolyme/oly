import { IAnyFunction } from "oly-core";
import * as React from "react";

/**
 * nothing
 *
 * @param func
 */
export const styles = (func: IAnyFunction) => {
  return (target: React.ComponentClass<any> | React.StatelessComponent<any>) => {
    // ...
  };
};
