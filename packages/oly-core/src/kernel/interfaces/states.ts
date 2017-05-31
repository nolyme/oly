import { IMetadata } from "../../decorator/interfaces";
import { IAnyFunction } from "./global";

export interface IStore {
  [key: string]: any;
}

export interface IStatesMetadata extends IMetadata {
  properties: {
    [key: string]: {
      readonly?: boolean;
      name?: string;
      type?: IAnyFunction;
    };
  };
}

export interface IStateMutateEvent {
  key: string;
  newValue: any;
  oldValue: any;
}
