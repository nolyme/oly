import { HttpServerException } from "oly-http";
import { olyApiErrors } from "../src/constants/errors";
import { BadRequestException } from "../src/exceptions/BadRequestException";
import { NotFoundException } from "../src/exceptions/NotFoundException";

describe("HttpServerException", () => {

  it("is a internal error by default", () => {
    expect(new HttpServerException().status).toBe(500);
    expect(new HttpServerException().message).toBe(olyApiErrors.internalError());
    expect(new HttpServerException("Toto").message).toBe("Toto");
  });

  it("can have child", () => {
    const notFound = new NotFoundException();
    expect(new NotFoundException().status).toBe(404);
    expect(new BadRequestException().message).toBe(olyApiErrors.badRequest());
    expect(new NotFoundException("Boom").message).toBe("Boom");
    expect(new NotFoundException(new Error("Broken")).message).toBe(olyApiErrors.notFound());
    expect(notFound.message).toBe(olyApiErrors.notFound());
  });
});
