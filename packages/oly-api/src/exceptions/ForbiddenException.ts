import { HttpServerException } from "oly-http";
import { olyApiErrors } from "../constants/errors";

export class ForbiddenException extends HttpServerException {

  public static readonly DEFAULT_MESSAGE: string = olyApiErrors.forbidden();

  public status: number = 403;
}
