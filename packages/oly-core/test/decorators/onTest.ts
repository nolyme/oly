import { deepEqual } from "assert";
import { lyEvents } from "../../src/constants/keys";
import { on } from "../../src/decorators/on";
import { MetadataUtil } from "../../src/utils/MetadataUtil";

describe("@state", () => {
  it("should write meta", () => {

    class A {
      @on("B") b: string;
    }

    deepEqual(
      MetadataUtil.get(lyEvents, A),
      {b: {name: "B"}},
    );
  });
  it("should allow no-name", () => {

    class A {
      @on b: string;
    }

    deepEqual(
      MetadataUtil.get(lyEvents, A),
      {b: {name: undefined}},
    );
  });
});
