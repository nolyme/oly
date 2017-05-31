import { Kernel } from "../Kernel";
import { IDeclaration } from "./injections";

/**
 * Implicit Any Function.
 * This is allowed by TypeScript and TSLint.
 * This is a big shit.
 *
 * Do not use it.
 *
 * @alias Function
 */
export type IAnyFunction = Function; // tslint:disable-line

/**
 * Typed factory of a class.
 * This is used by Kernel for Factory injections.
 */
export type IFactoryOf<T> = (kernel: Kernel, parent?: IClass) => T;

/**
 * Function which can be instantiate.
 *
 * ```typescript
 * class A {}
 * const log = (type: IClass) => console.log(type);
 * log(A); // fine
 * ```
 */
export interface IClass {
  name?: string;
  new (...args: any[]): any;
}

/**
 * It's like IClass, but with type.
 * This is very useful for generic type combination.
 *
 * ```typescript
 * class A {}
 * const log = (type: IClassOf<A>) => console.log(type);
 * log(A); // fine
 * ```
 *
 */
export interface IClassOf<T> {
  name?: string;
  new (...args: any[]): T;
}

/**
 * This is how we see a provider.
 * It's just 3 little hooks.
 * This is completely optional, do not use it.
 */
export interface IProvider {
  // before onStart(), A -> Z
  onConfigure?(deps: Array<IDeclaration<any>>): Promise<void> | void;
  // when you Kernel#start(), Z -> A
  onStart?(deps: Array<IDeclaration<any>>): Promise<void> | void;
  // when you Kernel#stop(), Z -> A
  onStop?(deps: Array<IDeclaration<any>>): Promise<void> | void;
}

/**
 * IDefinition is just a class.
 */
export type IDefinition<T> = IClassOf<T>;

/**
 * Any Definition.
 */
export type IAnyDefinition = IDefinition<any>;
