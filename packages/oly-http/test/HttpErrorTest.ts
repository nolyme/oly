import { equal } from "assert";
import { HttpError } from "../src";

describe("HttpError", () => {
  describe("#constructor()", () => {

    it("should get a status", () => {
      try {
        throw new HttpError(400);
      } catch (e) {
        equal(e.message, HttpError.MESSAGES[400]);
      }
    });
    it("should get a status, message", () => {
      try {
        throw new HttpError(404, "User Not Found");
      } catch (e) {
        equal(e.status, 404);
        equal(e.message, "User Not Found");
      }
    });
    it("should get a s, m, details", () => {
      try {
        throw new HttpError(400, "Validation has failed", {errors: [{a: "b"}]});
      } catch (e) {
        equal(e.status, 400);
        equal(e.message, "Validation has failed");
        equal(e.details.errors.length, 1);
      }
    });
    it("should get an error", () => {
      try {
        try {
          throw new HttpError(500, "Database is broken yo");
        } catch (e) {
          throw new HttpError(400, "Client has failed", e);
        }
      } catch (e) {
        equal(e.status, 400);
        equal(e.message, "Client has failed");
        equal(e.details.status, 500);
      }
    });
  });
});
