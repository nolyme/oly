import { field } from "oly-mapper";
import { attachKernel } from "oly-test";
import { Repository } from "../src";

describe("MongoProvider", () => {

  class MyModel {
    @field name: string;
  }

  class MyRepository extends Repository.of(MyModel) {
  }

  const kernel = attachKernel();
  const myRepository = kernel.get(MyRepository);

  it("should save data", async () => {
    await myRepository.clear();
    expect(await myRepository.count()).toBe(0);
    await myRepository.save({name: "Hello"});
    expect(await myRepository.count()).toBe(1);
    await myRepository.clear();
  });
});
