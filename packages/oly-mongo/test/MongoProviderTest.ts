import { Kernel } from "oly-core";
import { field } from "oly-json";
import { Repository } from "../src";

describe("MongoProvider", () => {

  class MyModel {
    @field name: string;
  }

  class MyRepository extends Repository.of(MyModel) {
  }

  const kernel = Kernel.create();
  const myRepository = kernel.get(MyRepository);

  it("should save data", async () => {
    await myRepository.clear();
    expect(await myRepository.count()).toBe(0);
    await myRepository.save({name: "Hello"});
    expect(await myRepository.count()).toBe(1);
    await myRepository.clear();
  });
});
