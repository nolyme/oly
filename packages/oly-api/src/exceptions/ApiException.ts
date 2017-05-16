import { Exception } from "oly-core";
import { olyApiErrors } from "../constants/errors";

export class ApiException extends Exception {

  public static readonly DEFAULT_MESSAGE: string = olyApiErrors.internalError();

  public status: number = 500;

  public toString(): string {
    const source = this.source ? `\n\n Caused by: ${this.source}` : "";
    return `${this.name}(${this.status}): ${this.message}${this.stack}${source}`;
  }

  public toJSON(): object {
    return {
      message: this.message,
      name: this.name,
      status: this.status,
    };
  }
}
