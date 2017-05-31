import { IMetadata } from "../../decorator/interfaces";
import { IAnyDefinition, IClass, IClassOf, IDefinition, IFactoryOf } from "./global";

/**
 * How to define a declaration.
 */
export interface IDeclaration<T> {
  // each or once ?
  singleton: boolean;
  // the definition
  definition: IDefinition<T>;
  // cached instance
  instance?: T;
  // how to create our instance
  use: IClassOf<T> | IFactoryOf<T>;
  // who rely on it
  children: Array<{
    // definition
    type: IAnyDefinition;
  }>;
}

/**
 * @alias IDeclaration<T>
 */
export type IAnyDeclaration = IDeclaration<any>;

/**
 * Public list of declarations.
 * Used by #onStart() and #onStop().
 */
export type IDeclarations = IAnyDeclaration[];

/**
 * Inline complex definition.
 */
export interface IComplexDefinition<T> {
  // definition identifier
  provide: IClassOf<T>;
  // the used definition/factory. default is value of `provide`
  use?: IClassOf<T> | IFactoryOf<T>;
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
    provide?: IClassOf<any>;
  };
}

/**
 *
 */
export interface IInjectionsMetadata extends IMetadata {
  properties: {
    [key: string]: {
      // definition
      type: IAnyDefinition;
    };
  };
}

/**
 * Kernel#get() options.
 */
export interface IKernelGetOptions {
  parent?: IClass;
  register?: boolean;
  instance?: any;
}
