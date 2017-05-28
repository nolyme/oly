import { HttpServerException } from "oly-http";
import { olySecurityErrors } from "../constants/errors";

export class TokenExpiredException extends HttpServerException {
  public status = 401;
  public message = olySecurityErrors.tokenExpired();
}
