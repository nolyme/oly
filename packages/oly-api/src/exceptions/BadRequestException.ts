import { HttpServerException } from "oly-http";
import { olyApiErrors } from "../constants/errors";

export class BadRequestException extends HttpServerException {

  public static readonly defaultMessage: string = olyApiErrors.badRequest();

  public status: number = 400;
}
