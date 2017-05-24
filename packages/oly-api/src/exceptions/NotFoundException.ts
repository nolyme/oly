import { HttpServerException } from "oly-http";
import { olyApiErrors } from "../constants/errors";

export class NotFoundException extends HttpServerException {

  public static readonly defaultMessage: string = olyApiErrors.notFound();

  public status: number = 404;
}
