import { deepEqual } from "assert";
import { lyDefinition } from "../../src/constants/keys";
import { injectable } from "../../src/decorators/injectable";
import { MetadataUtil } from "../../src/utils/MetadataUtil";

describe("@injectable", () => {
  it("should set meta", () => {

    class B {
    }

    const use = () => new A();

    @injectable({
      provide: B,
      use,
      singleton: false,
    })
    class A {
    }

    deepEqual(
      MetadataUtil.get(lyDefinition, A),
      {provide: B, use, singleton: false},
    );
  });
});
