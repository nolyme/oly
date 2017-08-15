import { Class } from "../kernel/interfaces/injections";
import { Kernel } from "../kernel/Kernel";

/**
 *
 */
export interface IMetaIdentifier {
  key: string;
  target: object | Function;
  propertyKey?: string;
  index?: number;
}

/**
 *
 */
export interface IDecorator {

  asClass?(target: Function): void;

  asProperty?(target: object, propertyKey: string): void;

  asMethod?(target: object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>): void;

  asParameter?(target: object, propertyKey: string, index: number): void;
}

export interface IDecoratorHooks {
  beforeAsClass: Function[];
  beforeAsProperty: Function[];
  beforeAsMethod: Function[];
  beforeAsParameter: Function[];
}

/**
 *
 */
export interface IDecoratorConstructor {
  new(data1?: any, data2?: any, data3?: any): IDecorator;
}

/**
 *
 */
export type IGenericDecorator =
  (data?: object | Function, p?: string, i?: number | TypedPropertyDescriptor<any>) => any;

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

/**
 *
 */
export interface IAspectParameter {
  call: (valid?: boolean) => void;
  arguments: any[];
  kernel?: Kernel;
  target: Class;
  propertyKey: string;
}
