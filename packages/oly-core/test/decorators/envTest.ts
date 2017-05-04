import { deepEqual } from "assert";
import { lyStates } from "../../src/constants/keys";
import { env } from "../../src/decorators/env";
import { MetadataUtil } from "../../src/utils/MetadataUtil";

describe("@env", () => {
  it("should write ro meta", () => {

    class A {
      @env("B") public b: string;
    }

    deepEqual(
      MetadataUtil.get(lyStates, A),
      {b: {readonly: true, name: "B"}},
    );
  });
});
