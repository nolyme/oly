import { IMetadata } from "../../decorator/interfaces";
import { Kernel } from "../Kernel";

/**
 * How to define a declaration.
 */
export interface IDeclaration<T extends IProvider = IProvider> {
  // each or once ?
  singleton: boolean;
  // the definition
  definition: Class<T>;
  // cached instance
  instance?: T;
  // how to create our instance
  use: Class<T> | IFactoryOf<T>;
  // who rely on it
  children: Array<{
    // definition
    type: Function;
  }>;
}

/**
 * Public list of declarations.
 * Used by #onStart() and #onStop().
 */
export type IDeclarations = IDeclaration[];

/**
 * Inline complex definition.
 */
export interface IDefinition<T extends IProvider = IProvider> {
  // definition identifier
  provide: Class<T>;
  // the used definition/factory. default is value of `provide`
  use?: Class<T> | IFactoryOf<T>;
}

/**
 *
 */
export interface IInjectableMetadata extends IMetadata {
  target: {
    // provide only one instance, default to true
    singleton?: boolean;
    // specify a custom instance factory
    use?: IFactoryOf<any>;
    // force the definition identifier
    provide?: Class<any>;
  };
}

/**
 *
 */
export interface IInjectionsMetadata extends IMetadata {
  properties: {
    [key: string]: {
      // definition
      type: Class<any>;
    };
  };
}

/**
 * Kernel#get() options.
 */
export interface IKernelGetOptions {
  parent?: Function;
  register?: boolean;
  instance?: any;
}

/**
 * Typed factory of a class.
 * This is used by Kernel for Factory injections.
 */
export type IFactoryOf<T> = (kernel: Kernel, parent?: Function) => T;

/**
 *
 */
export interface Class<T = object> { // tslint:disable-line
  name: string;

  new(...args: any[]): T;
}

/**
 * This is how we see a provider.
 * It's just 3 little hooks.
 * This is completely optional, do not use it.
 */
export interface IProvider {

  // before onStart(), A -> Z
  onConfigure?(deps: Array<IDeclaration<any>>): any;

  // when you Kernel#start(), Z -> A
  onStart?(deps: Array<IDeclaration<any>>): any;

  // when you Kernel#stop(), Z -> A
  onStop?(deps: Array<IDeclaration<any>>): any;

  // internal free function
  // remove all listener
  __free__?(): void;
}
