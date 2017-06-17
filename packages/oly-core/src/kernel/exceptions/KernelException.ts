import { Exception } from "../../exception/Exception";

/**
 * Example of Exception override.
 *
 * ```ts
 * throw new KernelException();
 * ```
 */
export class KernelException extends Exception {
}
