import { HttpServerException } from "oly-http";
import { olyApiErrors } from "../constants/errors";

export class BadRequestException extends HttpServerException {

  public static readonly DEFAULT_MESSAGE: string = olyApiErrors.badRequest();

  public status: number = 400;
}
