import { IMetadata } from "../../decorator/interfaces";
import { IClass } from "./global";

/**
 *
 */
export type IEventCallback = (data?: object) => any;

/**
 *
 */
export interface IEventReference {
  target: IClass;
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
export interface IEventsMetadata extends IMetadata {
  properties: {
    [key: string]: {
      name?: string;
    };
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
