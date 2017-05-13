import { deepEqual } from "assert";
import { lyStates } from "../../src/constants/keys";
import { state } from "../../src/decorators/state";
import { MetadataUtil } from "../../src/utils/MetadataUtil";

describe("@state", () => {
  it("should write meta", () => {

    class A {
      @state("B") b: string;
    }

    deepEqual(
      MetadataUtil.get(lyStates, A),
      {b: {readonly: false, name: "B", type: String}},
    );
  });
  it("should allow no-name", () => {

    class A {
      @state b: string;
    }

    deepEqual(
      MetadataUtil.get(lyStates, A),
      {b: {readonly: false, name: undefined, type: String}},
    );
  });
});
