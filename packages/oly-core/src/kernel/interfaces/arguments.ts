import { IMetadata } from "../../decorator/interfaces";
import { Kernel } from "../Kernel";

export interface IArgumentArg {
  id?: string;
  name?: string;
  type: any;
  handler: (kernel: Kernel, additionalArguments: any[]) => any;
}

export interface IArgumentsMetadata extends IMetadata {
  args: {
    [key: string]: IArgumentArg[];
  };
}
