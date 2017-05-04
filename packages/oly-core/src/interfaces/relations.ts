import { IClass, IClassOf, IFactoryOf } from "./types";

/**
 * IDefinition is just a class.
 *
 * @alias
 */
export type IDefinition<T> = IClassOf<T>;
export type IAnyDefinition = IDefinition<any>;

/**
 * IDefinition options.
 * This is used by the kernel and @injectable.
 */
export interface IDefinitionMetadata<T> {
  // provide only one instance, default to true
  singleton?: boolean;
  // specify a custom instance factory
  use?: IFactoryOf<T>;
  // force the definition identifier
  provide?: IClassOf<T>;
}

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
  children: IDependencyMetadata[];
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
 * Dependency metadata.
 */
export interface IDependencyMetadata {
  type: IAnyDefinition;
}

/**
 * Map of IDependencyMetadata.
 */
export interface IDependencyMetadataMap {
  [key: string]: IDependencyMetadata;
}

/**
 * Kernel#get() options.
 */
export interface IKernelGetOptions {
  parent?: IClass;
  register?: boolean;
  instance?: any;
}
