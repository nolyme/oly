import { IMetadata } from "../../metadata/interfaces";

/**
 *
 */
export interface IStore {
  [key: string]: any;
}

/**
 *
 */
export interface IStatesMetadata extends IMetadata {
  properties: {
    [key: string]: {
      readonly?: boolean;
      name?: string;
      type?: Function;
    };
  };
}

/**
 *
 */
export interface IStateMutateEvent {
  key: string;
  newValue: any;
  oldValue: any;
}
