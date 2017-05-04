import { deepEqual, equal } from "assert";
import { array } from "../src";
import { field } from "../src/decorators/field";
import { ObjectMapper } from "../src/ObjectMapper";

describe("ObjectMapper", () => {
  it("should parse an object", () => {

    class SubData {
      @field() hello: string;

      get upper() {
        return this.hello.toUpperCase();
      }
    }

    class Data {
      @array({of: String}) arr1: string[];
      @array({of: SubData}) arr2: SubData[];
      @field() bo: boolean;
      @field() num: number;
      @field() str: string;
      @field() sub: SubData;

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
    };

    const oly = new ObjectMapper();
    const obj = oly.parse(Data, JSON.stringify(raw));

    equal(obj.msg, "hello world a1true");
    equal(obj.arr1.join(""), "ab");
    equal(obj.arr2[0].upper, "TEST");

    deepEqual(oly.schema(Data), {
      name: "Data",
      properties: {
        arr1: {type: "array"},
        arr2: {
          items: [{
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
          }],
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
      },
      required: [
        "arr1",
        "arr2",
        "bo",
        "num",
        "str",
        "sub",
      ],
      type: "object",
    });
  });
  it("should display message on error", () => {

    class Credentials {
      @field() username: string;
      @field() password: string;
    }

    const oly = new ObjectMapper();
    const entry = {
      username: 2,
    };

    const localize = {
      fr: require("ajv-i18n/localize/fr"),
    };

    try {
      oly.validate(Credentials, entry);
      throw new Error("");
    } catch (e) {
      localize.fr(e.details);
      equal(oly.ajv.errorsText(e.details), "data.username doit être de type string");
      equal(e.message, "Validation has failed (data.username should be string)");
    }
  });
});
