import { TypeParser } from "../../src/type/TypeParser";

describe("TypeParser", () => {

  it("should parse as string", () => {
    expect(TypeParser.parse(String, undefined)).toBe(undefined);
    expect(TypeParser.parse(String, null)).toBe(undefined);
    expect(TypeParser.parse(String, "true")).toBe("true");
    expect(TypeParser.parse(String, "false")).toBe("false");
    expect(TypeParser.parse(String, "")).toBe("");
    expect(TypeParser.parse(String, "azd")).toBe("azd");
    expect(TypeParser.parse(String, "0")).toBe("0");
    expect(TypeParser.parse(String, "1")).toBe("1");
    expect(TypeParser.parse(String, 1)).toBe("1");
    expect(TypeParser.parse(String, 0)).toBe("0");
    expect(TypeParser.parse(String, -1)).toBe("-1");
    expect(TypeParser.parse(String, true)).toBe("true");
    expect(TypeParser.parse(String, false)).toBe("false");
    expect(TypeParser.parse(String, {})).toBe("{}");
    expect(TypeParser.parse(String, {a: "b"})).toBe("{\"a\":\"b\"}");
    expect(TypeParser.parse(String, [])).toBe("[]");
    expect(TypeParser.parse(String, [1, 2, 3])).toBe("[1,2,3]");
  });

  it("should parse as boolean", () => {
    expect(TypeParser.parse(Boolean, undefined)).toBe(false);
    expect(TypeParser.parse(Boolean, null)).toBe(false);
    expect(TypeParser.parse(Boolean, "true")).toBe(true);
    expect(TypeParser.parse(Boolean, "false")).toBe(false);
    expect(TypeParser.parse(Boolean, "")).toBe(false);
    expect(TypeParser.parse(Boolean, "azd")).toBe(true);
    expect(TypeParser.parse(Boolean, "0")).toBe(false);
    expect(TypeParser.parse(Boolean, "1")).toBe(true);
    expect(TypeParser.parse(Boolean, 1)).toBe(true);
    expect(TypeParser.parse(Boolean, 0)).toBe(false);
    expect(TypeParser.parse(Boolean, -1)).toBe(true);
    expect(TypeParser.parse(Boolean, true)).toBe(true);
    expect(TypeParser.parse(Boolean, false)).toBe(false);
    expect(TypeParser.parse(Boolean, {})).toBe(true);
    expect(TypeParser.parse(Boolean, {a: "b"})).toBe(true);
    expect(TypeParser.parse(Boolean, [])).toBe(true);
    expect(TypeParser.parse(Boolean, [1, 2, 3])).toBe(true);
  });

  it("should parse as number", () => {
    expect(TypeParser.parse(Number, undefined)).toBe(undefined);
    expect(TypeParser.parse(Number, null)).toBe(undefined);
    expect(TypeParser.parse(Number, "true")).toBeNaN();
    expect(TypeParser.parse(Number, "false")).toBeNaN();
    expect(TypeParser.parse(Number, "")).toBe(undefined);
    expect(TypeParser.parse(Number, "azd")).toBeNaN();
    expect(TypeParser.parse(Number, "0")).toBe(0);
    expect(TypeParser.parse(Number, "1")).toBe(1);
    expect(TypeParser.parse(Number, 1)).toBe(1);
    expect(TypeParser.parse(Number, 0)).toBe(0);
    expect(TypeParser.parse(Number, -1)).toBe(-1);
    expect(TypeParser.parse(Number, true)).toBe(1);
    expect(TypeParser.parse(Number, false)).toBe(0);
    expect(TypeParser.parse(Number, {})).toBeNaN();
    expect(TypeParser.parse(Number, {a: "b"})).toBeNaN();
    expect(TypeParser.parse(Number, [])).toBe(0); // wtf ?
    expect(TypeParser.parse(Number, [1, 2, 3])).toBeNaN();
  });

  it("should parse as object", () => {
    const now = new Date();
    expect(TypeParser.parse(Object, undefined)).toBe(undefined);
    expect(TypeParser.parse(Object, null)).toBe(undefined);
    expect(TypeParser.parse(Object, "true")).toEqual("true");
    expect(TypeParser.parse(Object, "false")).toEqual("false");
    expect(TypeParser.parse(Object, "")).toBe("");
    expect(TypeParser.parse(Object, "azd")).toEqual("azd");
    expect(TypeParser.parse(Object, "0")).toEqual("0");
    expect(TypeParser.parse(Object, "1")).toEqual("1");
    expect(TypeParser.parse(Object, 1)).toEqual(1);
    expect(TypeParser.parse(Object, 0)).toBe(0);
    expect(TypeParser.parse(Object, -1)).toEqual(-1);
    expect(TypeParser.parse(Object, true)).toEqual(true);
    expect(TypeParser.parse(Object, false)).toBe(false);
    expect(TypeParser.parse(Object, {})).toEqual({});
    expect(TypeParser.parse(Object, {a: "b"})).toEqual({a: "b"});
    expect(TypeParser.parse(Object, "{\"a\":\"b\"}")).toEqual({a: "b"});
    expect(TypeParser.parse(Object, [])).toEqual([]);
    expect(TypeParser.parse(Object, [1, 2, 3])).toEqual([1, 2, 3]);
    expect(TypeParser.parse(Object, "[1,2,3]")).toEqual([1, 2, 3]);
    expect(TypeParser.parse(Date, now.toISOString())).toEqual(now);
  });
});
