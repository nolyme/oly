import { IMetadata } from "../../meta/interfaces";
import { Class } from "./injections";

/**
 *
 */
export type IEventCallback = (data?: object) => any;

/**
 *
 */
export interface IEventReference {
  target: Class<any>;
  propertyKey: string;
  instance?: any;
}

/**
 * Event registration.
 */
export interface IEventListener {
  key: string;
  action: IEventCallback | IEventReference;
  unique: boolean;
}

/**
 *
 */
export interface IObserver {
  free: () => void;
  wait: () => Promise<any>;
}

/**
 *
 */
export interface IEventProperty {
  name?: string;
}

/**
 *
 */
export interface IEventsMetadata extends IMetadata {
  properties: {
    [key: string]: IEventProperty;
  };
}

/**
 *
 */
export interface IKernelOnOptions {
  unique?: boolean;
}

/**
 *
 */
export interface IKernelEmitOptions {
  parent?: boolean;
  fork?: boolean;
}

export interface IListener {

  // internal free function
  // remove all listener
  __free__?(): void;
}
