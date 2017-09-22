import { IMetadata } from "../../metadata/interfaces";
import { Kernel } from "../Kernel";

export interface IArgumentArg {
  /**
   * "Identifier" of the argument.
   * Optional.
   */
  id?: string;
  /**
   * Name of the argument.
   * Optional.
   */
  name?: string;
  /**
   * Type of argument.
   * Recommended.
   */
  type: any;
  /**
   * Handler.
   * Mandatory.
   *
   * @param {Kernel} kernel
   * @param {any[]} additionalArguments
   * @returns {any}
   */
  handler: (kernel: Kernel, additionalArguments: any[]) => any;
}

export interface IArgumentsMetadata extends IMetadata {
  args: {
    [key: string]: IArgumentArg[];
  };
}

export interface IEnv {

}
