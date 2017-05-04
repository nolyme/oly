import { deepEqual } from "assert";
import { lyDependencies } from "../../src/constants/keys";
import { inject } from "../../src/decorators/inject";
import { MetadataUtil } from "../../src/utils/MetadataUtil";

describe("@inject", () => {
  it("should set implicit B", () => {

    class B {

    }
    class A {
      @inject b: B;
    }

    deepEqual(
      MetadataUtil.get(lyDependencies, A),
      {b: {type: B}},
    );
  });
  it("should set explicit B", () => {

    class B {

    }
    class A {
      @inject(B) b: any;
    }

    deepEqual(
      MetadataUtil.get(lyDependencies, A),
      {b: {type: B}},
    );
  });
});
