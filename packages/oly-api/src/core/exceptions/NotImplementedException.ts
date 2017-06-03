import { HttpServerException } from "oly-http";
import { olyApiErrors } from "../constants/errors";

export class NotImplementedException extends HttpServerException {

  public message: string = olyApiErrors.notImplemented();

  public status: number = 501;
}
