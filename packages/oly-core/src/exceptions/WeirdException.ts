import { ErrorOrException, Exception } from "./Exception";

/**
 * Example of Exception override.
 *
 * ```typescript
 * throw new WeirdException();
 * ```
 */
export class WeirdException extends Exception {
  constructor(e: ErrorOrException) {
    super(e, "It's really weird");
  }
}
