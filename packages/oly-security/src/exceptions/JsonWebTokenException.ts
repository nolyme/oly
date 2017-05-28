import { HttpServerException } from "oly-http";

export class JsonWebTokenException extends HttpServerException {
  public status: number = 401;
}
