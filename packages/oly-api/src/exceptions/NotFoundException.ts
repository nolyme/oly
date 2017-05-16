import { olyApiErrors } from "../constants/errors";
import { ApiException } from "./ApiException";

export class NotFoundException extends ApiException {

  public static readonly DEFAULT_MESSAGE: string = olyApiErrors.notFound();

  public status: number = 404;
}
