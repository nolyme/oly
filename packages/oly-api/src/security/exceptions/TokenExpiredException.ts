import { HttpServerException } from "oly-http";
import { olySecurityErrors } from "../constants/errors";

/**
 *
 */
export class TokenExpiredException extends HttpServerException {

  public message = olySecurityErrors.tokenExpired();

  public status = 401;
}
