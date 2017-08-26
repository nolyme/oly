import { Kernel, TypeParser } from "oly";
import { IField } from "../src/interfaces";
import { JsonValidator } from "../src/services/JsonValidator";

describe("JsonValidator", () => {

  const kernel = Kernel.create();
  const validator = kernel.inject(JsonValidator);

  it("should valid string", () => {

    const test: IField = {
      maxLength: 8,
      minLength: 2,
      name: "string",
      type: String,
    };

    expect(() => validator.validateField(test, "toto")).not.toThrow();
    expect(() => validator.validateField(test, "t")).toThrow();
    expect(() => validator.validateField(test, 3)).toThrow();
    expect(() => validator.validateField(test, "aiozjdazd")).toThrow();
  });

  it("should valid boolean", () => {

    const test: IField = {
      name: "boolean",
      type: Boolean,
    };

    expect(() => validator.validateField(test, true)).not.toThrow();
    expect(() => validator.validateField(test, false)).not.toThrow();
    expect(() => validator.validateField(test, "true")).toThrow();
    expect(() => validator.validateField(test, 0)).toThrow();
    expect(() => validator.validateField(test, 1)).toThrow();
    expect(() => validator.validateField(test, "akzdnl")).toThrow();
    expect(() => validator.validateField(test, {})).toThrow();
    expect(() => validator.validateField(test, TypeParser.parse(Boolean, "true"))).not.toThrow();
  });
});
