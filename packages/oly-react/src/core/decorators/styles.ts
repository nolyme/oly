import { Function } from "oly-core";
import * as React from "react";

/**
 * nothing
 *
 * @param func
 */
export const styles = (func: Function) => {
  return (target: React.ComponentClass<any> | React.StatelessComponent<any>) => {
    // ...
  };
};
