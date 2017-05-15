import { attachKernel } from "oly-test";
import { IField } from "../src/interfaces";
import { JsonValidator } from "../src/services/JsonValidator";
import { TypeUtil } from "../src/utils/TypeUtil";

describe("JsonValidator", () => {

  const kernel = attachKernel();
  const validator = kernel.get(JsonValidator);
  const error = /Validation has failed/;

  it("should valid string", () => {

    const test: IField = {
      maxLength: 8,
      minLength: 2,
      name: "string",
      type: String,
    };

    expect(() => validator.validateField(test, "toto")).not.toThrow();
    expect(() => validator.validateField(test, "t")).toThrow(error);
    expect(() => validator.validateField(test, 3)).toThrow(error);
    expect(() => validator.validateField(test, "aiozjdazd")).toThrow(error);
  });

  it("should valid boolean", () => {

    const test: IField = {
      name: "boolean",
      type: Boolean,
    };

    expect(() => validator.validateField(test, true)).not.toThrow();
    expect(() => validator.validateField(test, false)).not.toThrow();
    expect(() => validator.validateField(test, "true")).toThrow(error);
    expect(() => validator.validateField(test, 0)).toThrow(error);
    expect(() => validator.validateField(test, 1)).toThrow(error);
    expect(() => validator.validateField(test, "akzdnl")).toThrow(error);
    expect(() => validator.validateField(test, {})).toThrow(error);
    expect(() => validator.validateField(test, TypeUtil.forceBoolean("true"))).not.toThrow(error);
  });
});
