import { olyCoreErrors } from "../../src/constants/errors";
import { Exception } from "../../src/exceptions/Exception";
import { KernelException } from "../../src/exceptions/KernelException";

describe("Exception", () => {

  it("should have custom message", () => {
    expect(new Exception("A").message).toBe("A");
    expect(() => {
      throw new Exception("A");
    }).toThrow("A");
  });

  it("should have default message", () => {
    expect(new Exception().message).toBe(olyCoreErrors.defaultException());
    expect(() => {
      throw new Exception();
    }).toThrow(olyCoreErrors.defaultException());
  });

  it("should have name", () => {
    expect(new Exception().name).toBe("Exception");
    expect(new KernelException().name).toBe("KernelException");
  });

  it("should be json aware", () => {
    expect(JSON.stringify(new Exception("boom"))).toBe(JSON.stringify({
      message: "boom",
      name: "Exception",
    }));
  });

  it("should be string aware", () => {
    expect(new Exception("boom").stack)
      .toMatch(/Exception: boom\n.*at/);
  });

  it("should have a cause", () => {
    expect(new Exception(new Exception("A"), "B").cause!.message).toBe("A");
    expect(() => {
      throw new Exception(new Exception("A"), "B");
    }).toThrow(/B/);
    expect(new Exception(new Exception("A"), "B").stack).toMatch(/Caused by: Exception: A/);
  });

  it("should accept legacy error as source", () => {
    expect(new KernelException(new RangeError("That's bad.")).cause!.name).toBe("RangeError");
  });
});
