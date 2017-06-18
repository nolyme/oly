import { ErrorObject } from "ajv";
import { Exception } from "oly-core";

/**
 *
 */
export class ValidationException extends Exception {

  public errors: ErrorObject[];

  public status: number = 400;

  public constructor(message: string, errors: ErrorObject[]) {
    super(message);
    this.errors = errors;
  }

  /**
   *
   */
  public toJSON(): object {
    return {
      ...super.toJSON(),
      status: this.status,
      errors: this.errors,
    };
  }
}
