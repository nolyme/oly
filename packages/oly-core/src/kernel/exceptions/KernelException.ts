import { Exception } from "../../exception/Exception";

/**
 * Example of Exception override.
 *
 * ```typescript
 * throw new KernelException();
 * ```
 */
export class KernelException extends Exception {
}
