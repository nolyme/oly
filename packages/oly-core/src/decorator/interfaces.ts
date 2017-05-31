import { IAnyFunction } from "../kernel/interfaces/global";

/**
 *
 */
export interface IMetaIdentifier {
  key: string;
  target: object | IAnyFunction;
  propertyKey?: string;
  index?: number;
}

/**
 *
 */
export interface IDecorator {
  asClass?(target: IAnyFunction): void;
  asProperty?(target: object, propertyKey: string): void;
  asMethod?(target: object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>): void;
  asParameter?(target: object, propertyKey: string, index: number): void;
}

/**
 *
 */
export type IGenericDecorator =
  (data?: object | IAnyFunction, p?: string, i?: number | TypedPropertyDescriptor<any>) => any;

/**
 *
 */
export type IGenericDecoratorFactory<T> =
  (data?: T, p?: string, i?: number) => IGenericDecorator;

/**
 *
 */
export interface IMetadata {
  target: any;
  properties: {
    [key: string]: any;
  };
  args: {
    [key: string]: any[];
  };
}
