import { HttpServerException } from "oly-http";
import { olyApiErrors } from "../constants/errors";

export class ConflictException extends HttpServerException {

  public message: string = olyApiErrors.conflict();

  public status: number = 409;
}
