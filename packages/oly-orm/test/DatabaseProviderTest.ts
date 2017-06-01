import { equal } from "assert";
import { attachKernel } from "oly-test";
import { column, entity, id } from "../src";
import { Repository } from "../src/providers/Repository";

@entity()
class Data {
  @id() id: number;
  @column() name: string;
}

class DataRepository extends Repository.of(Data) {
}

describe("DatabaseProvider", () => {

  const kernel = attachKernel({
    OLY_DATABASE_URL: ":memory:",
  });
  const dataRepository = kernel.get(DataRepository);

  it("should synchronise schema", async () => {
    equal(await dataRepository.count(), 0);
    await dataRepository.insert({name: "Jean"});
    equal(await dataRepository.count(), 1);
  });
});
