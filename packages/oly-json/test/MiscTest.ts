import { Kernel } from "oly";
import { array, Json, Type, ValidationException } from "../src";

describe("Misc", () => {

  describe("upper", () => {
    class Data {
      @array({
        of: {
          type: Type.STRING,
          upper: true,
        },
        default: [],
      })
      entries: string[];
    }

    const parse = (raw: any) => Kernel.create().get(Json).build(Data, raw);

    it("should upper", () => {
      expect(parse({})).toEqual({entries: []});
      expect(parse({entries: ["a", "B"]})).toEqual({entries: ["A", "B"]});
      expect(() => parse({entries: ["a", "B", 1]})).toThrow(ValidationException);
    });
  });
});
