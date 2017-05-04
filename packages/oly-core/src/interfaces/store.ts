import { IEnv } from "../env";

/**
 * Global store interface.
 */
export type IStore = IEnv & {
  [key: string]: any;
};

/**
 * Virtual state metadata.
 */
export interface IVirtualStateMetadata {
  name?: string;
  readonly: boolean;
}

/**
 * Map of virtual state metadata.
 */
export interface IVirtualStateMetadataMap {
  [key: string]: IVirtualStateMetadata;
}

/**
 *
 */
export interface IStateMutate {
  key: string;
  newValue: any;
  oldValue: any;
}
