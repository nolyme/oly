/**
 * Global store interface.
 */
export interface IStore {
  [key: string]: any;
}

/**
 * Virtual state metadata.
 */
export interface IVirtualStateMetadata {
  name?: string;
  readonly: boolean;
  type: any;
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
