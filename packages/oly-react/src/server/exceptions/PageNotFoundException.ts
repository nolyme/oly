import { HttpServerException } from "oly-http";

export class NotFoundException extends HttpServerException {

  public status: number = 404;
}
