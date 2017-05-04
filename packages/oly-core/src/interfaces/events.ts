/**
 *
 */
import { IClass } from "./types";

export type IEventCallback = (data?: object) => any;

export interface IEventReference {
  target: IClass;
  propertyKey: string;
  instance?: any;
}

export interface IEventData {
  EXAMPLE?: { A: "B" };
}

/**
 * Event metadata.
 */
export interface IEventMetadata {
  name?: string;
}

/**
 * Map of IEventMetadata.
 */
export interface IEventMetadataMap {
  [key: string]: IEventMetadata;
}

/**
 * Event registration.
 */
export interface IEventListener {
  key: string;
  action: IEventCallback | IEventReference;
  unique: boolean;
}

export interface IObserver {
  free: () => void;
  wait: () => Promise<any>;
}

export interface IKernelOnOptions {
  unique?: boolean;
}

export interface IKernelEmitOptions {
  parent?: boolean;
  fork?: boolean;
}
