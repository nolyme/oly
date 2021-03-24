import { Kernel } from "oly";
import { optional } from "../src";
import { choice } from "../src/decorators/choice";
import { field } from "../src/decorators/field";
import { schema } from "../src/decorators/schema";
import { ValidationException } from "../src/exceptions/ValidationException";
import { Json } from "../src/services/Json";

describe("@schema", () => {

  @schema((s) => s)
  class A {
    @field c: string;
  }

  class B {
    @field d: string;
  }

  @choice(["a", "b"])
  @schema((s) => ({
    ...s,
    description: "Hi!",
  }))
  @schema({
    name: "Toto",
  })
  class Data {
    @field a: A;
    @field b: B;
    @field c: string;

    constructor(
      public d: boolean,
      @optional({
        description: "e",
      }) public e: boolean,
    ) {
    }
  }

  const kernel = Kernel.create();
  const json = kernel.inject(Json);

  it("should merge jsonschema", () => {
    expect(json.schema(Data)).toEqual({
      title: "Toto",
      description: "Hi!",
      oneOf: [{
        required: ["a"],
      }, {
        required: ["b"],
      }],
      required: ["c", "d"],
      properties: {
        a: {
          title: "A",
          properties: {
            c: {
              type: "string",
            },
          },
          required: ["c"],
          type: "object",
        },
        b: {
          title: "B",
          properties: {
            d: {
              type: "string",
            },
          },
          required: ["d"],
          type: "object",
        },
        c: {
          type: "string",
        },
        d: {
          type: "boolean",
        },
        e: {
          description: "e",
          type: "boolean",
        },
      },
      type: "object",
    });
  });

  it("should add custom jsonschema", () => {
    json.validate(Data, {a: {c: "ok"}, c: "ok", d: true});
    json.validate(Data, {b: {d: "ok"}, c: "ok", d: true});
    expect(() => json.validate(Data, {a: {c: "ok"}, b: {d: "ok"}, c: "ok"})).toThrow(ValidationException);
    expect(() => json.validate(Data, {c: "ok"})).toThrow(ValidationException);
  });
});
