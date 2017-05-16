import { olyApiErrors } from "../constants/errors";
import { ApiException } from "./ApiException";

export class BadRequestException extends ApiException {

  public static readonly DEFAULT_MESSAGE: string = olyApiErrors.badRequest();

  public status: number = 400;
}
