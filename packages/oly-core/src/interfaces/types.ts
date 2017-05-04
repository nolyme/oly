import { Kernel } from "../Kernel";
import { IDeclaration } from "./relations";

/**
 * So, you want a function without types.
 *
 * @alias Function
 */
export type IAnyFunction = Function; // tslint:disable-line

/**
 * Typed factory of a class.
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
 *
 * @alias Function
 */
export interface IClass {
  name?: string;
  new (...args: any[]): any;
}

/**
 * It's like IClass, but with type.
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
 * How we see a provider.
 * This is completely optional.
 */
export interface IProvider {
  onConfigure?(deps: Array<IDeclaration<any>>): Promise<void> | void;
  onStart?(deps: Array<IDeclaration<any>>): Promise<void> | void;
  onStop?(deps: Array<IDeclaration<any>>): Promise<void> | void;
}
