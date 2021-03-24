import { IMetadata } from "../../metadata/interfaces";
import { Kernel } from "../Kernel";

/**
 * How to define a declaration.
 */
export interface IDeclaration<T extends object = any> {
  // each or once ?
  singleton: boolean;
  // the definition
  definition: Class<T>;
  // cached instance
  instance?: T;
  // is started ?
  started?: boolean;
  // how to create our instance
  use: Class<T> | IFactory<T>;
  // who rely on it
  children: {
    // definition
    type: Function;
  }[];
}

/**
 * Public list of declarations.
 * Used by #onStart() and #onStop().
 */
export type IDeclarations = IDeclaration[];

/**
 * Inline complex definition.
 */
export interface IDefinition<T extends object = any> {
  // definition identifier
  provide: Class<T>;
  // the used definition/factory. default is value of `provide`
  use?: Class<T> | IFactory<T>;
}

/**
 *
 */
export interface IInjectableMetadata extends IMetadata {
  target: {
    // provide only one instance, default to true
    singleton?: boolean;
    // specify a custom instance factory
    use?: IFactory;
    // force the definition identifier
    provide?: Class;
  };
}

/**
 *
 */
export interface IInjectionsMetadata extends IMetadata {
  properties: {
    [key: string]: {
      // definition
      type: Class;
    };
  };
}

/**
 * Kernel#get() options.
 */
export interface IKernelGetOptions<T = any> {

  /**
   * Class who wants the injection.
   */
  parent?: Class;

  /**
   * Store the dependencies ?
   */
  register?: boolean;

  /**
   * Use this instance instead of created a new one.
   */
  instance?: T;
}

/**
 * Typed factory of a class.
 * This is used by Kernel for Factory injections.
 */
export type IFactory<T = any> = (kernel: Kernel, parent?: Class) => T;

/**
 *
 */
export type Class<T extends object = any> = new(...args: any[]) => T;

/**
 * This is how we see a provider.
 * It's just 3 little hooks.
 * This is completely optional, do not use it.
 */
export interface IProvider {

  // before onStart(), A -> Z
  onConfigure?(declarations: IDeclarations): any;

  // when you Kernel#start(), Z -> A
  onStart?(declarations: IDeclarations): any;

  // when you Kernel#stop(), Z -> A
  onStop?(declarations: IDeclarations): any;
}
