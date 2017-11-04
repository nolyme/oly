import { Kernel } from "oly";
import { array } from "../src";
import { field } from "../src/decorators/field";
import { ValidationException } from "../src/exceptions/ValidationException";
import { Json } from "../src/services/Json";
import { JsonValidator } from "../src/services/JsonValidator";

interface IPerson {
  name: string;
}

describe("ObjectMapper", () => {
  it("should parse an object", () => {

    class SubData {
      @field() hello: string;

      get upper() {
        return this.hello.toUpperCase();
      }
    }

    type A = "a" | "b";

    class Data {
      @array({of: String}) arr1: string[];
      @array({of: SubData}) arr2: SubData[];
      @field() bo: boolean;
      @field() num: number;
      @field str: A;
      @field sub: SubData;
      @field p: IPerson;

      get msg() {
        return "hello " + this.sub.hello + " " + this.str + this.num + this.bo;
      }
    }

    const raw = {
      arr1: ["a", "b"],
      arr2: [{hello: "test"}],
      bo: true,
      num: 1,
      str: "a",
      sub: {
        hello: "world",
      },
      p: {
        name: "ok",
      },
    };

    const json = Kernel.create().inject(Json);
    const obj = json.build(Data, JSON.stringify(raw));

    expect(obj.msg).toBe("hello world a1true");
    expect(obj.arr1.join("")).toBe("ab");
    expect(obj.arr2[0].upper).toBe("TEST");
    expect(obj.p.name).toBe("ok");

    expect(json.schema(Data)).toEqual({
      name: "Data",
      properties: {
        arr1: {items: {type: "string"}, type: "array"},
        arr2: {
          items: {
            name: "SubData",
            properties: {
              hello: {
                type: "string",
              },
            },
            required: [
              "hello",
            ],
            type: "object",
          },
          type: "array",
        },
        bo: {
          type: "boolean",
        },
        num: {
          type: "number",
        },
        str: {
          type: "string",
        },
        sub: {
          name: "SubData",
          properties: {
            hello: {
              type: "string",
            },
          },
          required: [
            "hello",
          ],
          type: "object",
        },
        p: {
          type: "object",
        },
      },
      required: [
        "arr1",
        "arr2",
        "bo",
        "num",
        "str",
        "sub",
        "p",
      ],
      type: "object",
    });
  });
  it("should display message on error", () => {

    class Credentials {
      @field() username: string;
      @field() password: string;
    }

    const json = Kernel.create().inject(JsonValidator);
    const entry = {
      username: 2,
    };

    const localize = {
      fr: require("ajv-i18n/localize/fr"),
    };

    try {
      json.validateClass(Credentials, entry);
      throw new Error("");
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationException);
      const ev: ValidationException = e;
      localize.fr(ev.errors);
      expect(json.ajv.errorsText(ev.errors)).toBe("data.username doit être de type string");
      expect(ev.message).toBe("Validation has failed (data.username should be string)");
    }

    try {
      json.validateField({type: String, name: "username"}, 1);
      throw new Error("");
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationException);
      const ev: ValidationException = e;
      localize.fr(ev.errors);
      expect(json.ajv.errorsText(ev.errors)).toBe("data doit être de type string");
      expect(ev.message).toBe("Validation has failed (data should be string)");
    }
  });
});
