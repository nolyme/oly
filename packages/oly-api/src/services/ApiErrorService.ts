import { HttpError } from "oly-http";

export class ApiErrorService {

  public missing(what: string, pathName: string): HttpError {
    return new HttpError(400, `Missing ${what} '${pathName}'`);
  }

  public validationHasFailed(details: any): HttpError {
    return new HttpError(400, `Validation has failed`, details);
  }

  public invalidFormat(type: string, key: string, expected: string) {
    return new HttpError(400, `Invalid format. The ${type} '${key}' expects ${expected}`);
  }
}
