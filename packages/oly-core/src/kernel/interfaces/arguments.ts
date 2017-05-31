import { IMetadata } from "../../decorator/interfaces";
import { Kernel } from "../Kernel";

export interface IArgumentsMetadata extends IMetadata {
  args: {
    [key: string]: Array<{
      type: any;
      handler: (kernel: Kernel) => any;
    }>;
  };
}
