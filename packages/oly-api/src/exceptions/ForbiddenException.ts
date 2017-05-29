import { HttpServerException } from "oly-http";
import { olyApiErrors } from "../constants/errors";

export class ForbiddenException extends HttpServerException {

  public message: string = olyApiErrors.forbidden();

  public status: number = 403;
}
