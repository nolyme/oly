import { Exception } from "../../src/exception/Exception";
import { olyCoreErrors } from "../../src/kernel/constants/errors";
import { KernelException } from "../../src/kernel/exceptions/KernelException";

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

  it("should have custom message when extends", () => {
    class Toto extends Exception {
      message = "A";
    }

    class Toto2 extends Toto {
      public message = "C";
      public status = 10;
    }

    class Toto3 extends Toto2 {
      public status = 11;

      constructor(letter: string) {
        super();
        this.message = `>${letter}<`;
      }
    }

    expect(new Toto().message).toBe("A");
    expect(new Toto("B").message).toBe("B");
    expect(new Toto2().message).toBe("C");
    expect(new Toto2("D").message).toBe("D");
    expect(new Toto2("D").status).toBe(10);
    expect(new Toto3("E").message).toBe(">E<");
    expect(new Toto3("E").status).toBe(11);
  });

  it("should have name", () => {
    expect(new Exception().name).toBe("Exception");
    expect(new KernelException().name).toBe("KernelException");

    class Toto extends KernelException {
    }

    expect(new Toto().name).toBe("Toto");
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
