import { HttpServerException } from "oly-http";
import { olyApiErrors } from "../constants/errors";

export class MethodNotAllowedException extends HttpServerException {

  public message: string = olyApiErrors.methodNotAllowed();

  public status: number = 405;
}
