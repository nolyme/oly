import { Exception } from "../../src/exception/Exception";

describe("Exception", () => {

  class ExtendedException extends Exception {
  }

  it("could have custom message", () => {
    expect(new Exception("A").message).toBe("A");
    expect(() => {
      throw new Exception("A");
    }).toThrow("A");
  });

  it("should have default message", () => {
    expect(new Exception().message).toBe(Exception.DEFAULT_MESSAGE);
    expect(() => {
      throw new Exception();
    }).toThrow(Exception.DEFAULT_MESSAGE);
  });

  it("should have custom message when extends", () => {
    class Toto extends Exception {
      constructor(message: string = "A") {
        super(message);
      }
    }

    class Toto2 extends Toto {
      public status = 10;
      constructor(message: string = "C") {
        super(message);
      }
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
  });

  it("should have name", () => {
    expect(new Exception().name).toBe("Exception");
    expect(new ExtendedException().name).toBe("ExtendedException");

    class Toto extends ExtendedException {
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

  it("should have a cause (because)", () => {
    expect(new Exception("B").because(new Exception("A")).cause!.message).toBe("A");
    expect(() => {
      throw new Exception("B").because(new Exception("A"));
    }).toThrow(/B/);
    expect(new Exception("B").because(new Exception("A")).stack).toMatch(/Caused by: Exception: A/);
  });

  it("should accept legacy error as source", () => {
    expect(new ExtendedException(new RangeError("That's bad.")).cause!.name).toBe("RangeError");
  });

  it("should be ok with instanceof", () => {

    class AnotherException extends ExtendedException {
    }

    class TheLastException extends Exception {
    }

    try {
      throw new AnotherException();
    } catch (e) {
      expect(e).toBeInstanceOf(Object);
      expect(e).toBeInstanceOf(Error);
      expect(e).toBeInstanceOf(Exception);
      expect(e).toBeInstanceOf(ExtendedException);
      expect(e).toBeInstanceOf(AnotherException);
      expect(e).not.toBeInstanceOf(TheLastException);
    }
  });

  it("should #toJSON with cause", () => {
    const ex = new Exception(new Error("Bad"), "Halt!");

    expect(JSON.parse(JSON.stringify(ex)))
      .toHaveProperty("cause.message", "Bad");
  });

  it("should display longTrace", () => {
    class TotoException extends Exception {
    }

    const ex = new TotoException(new Error("Bad"), "Halt!");
    const stack = ex.getLongStackTrace();
    expect(stack).toMatch(/Caused by: Error: Bad/);
  });
});
